import { useState } from 'react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import { gerarRelatorioServicosConsolidadoPDF } from '../../../../utils/relatorioServicosConsolidadoPdf';

export function useServicosSelecao() {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const toggleSelecionar = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = (servicos: ServicoHorimetro[]) => {
    if (selecionados.size === servicos.length && servicos.length > 0) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(servicos.map((s) => s.id)));
    }
  };

  const limparSelecao = () => setSelecionados(new Set());

  const exportarPdfSelecionados = (servicos: ServicoHorimetro[]) => {
    const filtrados = servicos.filter((s) => selecionados.has(s.id));
    if (filtrados.length === 0) return;
    const clientesUnicos = Array.from(
      new Set(filtrados.map((s) => s.cliente_nome?.trim()).filter((n): n is string => Boolean(n)))
    );
    const nomeCliente = clientesUnicos.length === 1
      ? clientesUnicos[0]
      : (clientesUnicos.length > 0 && clientesUnicos.length <= 2
          ? clientesUnicos.join(' & ')
          : 'Múltiplos Clientes');
    gerarRelatorioServicosConsolidadoPDF(filtrados, nomeCliente);
  };

  const excluirSelecionados = async (
    _servicos: ServicoHorimetro[],
    excluirFn: (id: string) => Promise<boolean>
  ) => {
    const count = selecionados.size;
    if (count === 0) return;
    if (!confirm(`Deseja realmente excluir os ${count} serviço(s) selecionados permanentemente?`)) return;

    for (const id of Array.from(selecionados)) {
      await excluirFn(id);
    }
    setSelecionados(new Set());
  };

  const selecionarApenasStatus = (servicos: ServicoHorimetro[], status: 'EM_ANDAMENTO' | 'FINALIZADO') => {
    const ids = servicos
      .filter((s) => (status === 'FINALIZADO' ? s.status === 'FINALIZADO' : s.status !== 'FINALIZADO'))
      .map((s) => s.id);
    setSelecionados(new Set(ids));
  };

  return {
    selecionados,
    toggleSelecionar,
    toggleTodos,
    limparSelecao,
    exportarPdfSelecionados,
    excluirSelecionados,
    selecionarApenasStatus
  };
}
