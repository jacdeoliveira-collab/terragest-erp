import { useState, useMemo } from 'react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

export type StatusFiltroServico = 'TODOS' | 'EM_ANDAMENTO' | 'FINALIZADO';

export function useServicosFiltros(servicos: ServicoHorimetro[]) {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltroServico>('TODOS');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      // 1. Filtro por status
      if (statusFiltro === 'EM_ANDAMENTO' && s.status === 'FINALIZADO') return false;
      if (statusFiltro === 'FINALIZADO' && s.status !== 'FINALIZADO') return false;

      // 2. Filtro por busca textual (cliente, obra, máquina, operador)
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const textoCompleto = [
          s.cliente_nome,
          s.obra_nome,
          s.maquina_nome,
          s.operador_nome,
          s.descricao_servico
        ].filter(Boolean).join(' ').toLowerCase();

        if (!textoCompleto.includes(termo)) return false;
      }

      // 3. Filtro por período de datas
      if (dataInicioFiltro && s.data_inicio < dataInicioFiltro) return false;
      if (dataFimFiltro) {
        const dtRef = s.data_fim || s.data_inicio;
        if (dtRef > dataFimFiltro) return false;
      }

      return true;
    });
  }, [servicos, statusFiltro, busca, dataInicioFiltro, dataFimFiltro]);

  const totalTodos = servicos.length;
  const totalEmAndamento = useMemo(() => servicos.filter((s) => s.status !== 'FINALIZADO').length, [servicos]);
  const totalFinalizados = useMemo(() => servicos.filter((s) => s.status === 'FINALIZADO').length, [servicos]);

  const limparFiltros = () => {
    setBusca('');
    setStatusFiltro('TODOS');
    setDataInicioFiltro('');
    setDataFimFiltro('');
  };

  const temFiltroAtivo = !!busca.trim() || statusFiltro !== 'TODOS' || !!dataInicioFiltro || !!dataFimFiltro;

  return {
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    dataInicioFiltro,
    setDataInicioFiltro,
    dataFimFiltro,
    setDataFimFiltro,
    servicosFiltrados,
    totalTodos,
    totalEmAndamento,
    totalFinalizados,
    limparFiltros,
    temFiltroAtivo
  };
}
