import { useMemo } from 'react';
import { useContasPagar } from './useContasPagar';
import { useContasReceber } from './useContasReceber';
import { useAlertasManutencao, type AlertaManutencao } from './useAlertasManutencao';
import { useFuncionarios } from './useFuncionarios';
import { useChecklists } from './useChecklists';
import { extrairAlertasFinanceiro } from '../utils/alertasFinanceiroHelper';
import { extrairAlertasOperacionais } from '../utils/alertasOperacionalHelper';
import type { AlertaItem, ModuloAlerta } from '../types/alertaCentral.types';

function textoManutencao(a: AlertaManutencao): string {
  const fmt = (n: number) => (a.unidade === 'km' ? Math.round(n).toLocaleString('pt-BR') : n.toFixed(1));
  if (a.nivel === 'CORRETIVA') return 'Checklist reprovado - OS corretiva aberta';
  if (a.nivel === 'VENCIDA') return `Revisão vencida há ${fmt(a.diferenca)} ${a.unidade}`;
  return `Revisão em ${fmt(a.diferenca)} ${a.unidade} (alvo ${fmt(a.leituraAlvo)} ${a.unidade})`;
}

export function useCentralAlertas() {
  const { data: pagar = [], isLoading: loadPagar } = useContasPagar();
  const { data: receber = [], isLoading: loadReceber } = useContasReceber();
  const { alertas: manutencao = [], isLoading: loadManut } = useAlertasManutencao();
  const { data: funcionarios = [], isLoading: loadRh } = useFuncionarios({ onlyActives: true });
  const { data: checklists = [], isLoading: loadChecklists } = useChecklists();

  const todosAlertas = useMemo<AlertaItem[]>(() => {
    const finAlertas = extrairAlertasFinanceiro(pagar, receber);
    const opAlertas = extrairAlertasOperacionais(funcionarios, checklists);

    const manAlertas: AlertaItem[] = manutencao.map((m) => ({
      id: `manut-${m.id}`,
      modulo: 'MANUTENCAO' as ModuloAlerta,
      titulo: `${m.maquina}: ${m.servico}`,
      descricao: textoManutencao(m),
      nivel: m.nivel === 'PROXIMA' ? 'ALERTA' : 'CRITICO',
      rota: '/manutencao',
      tagModulo: 'Manutenção'
    }));

    const todos = [...finAlertas, ...manAlertas, ...opAlertas];

    // Ordenação: CRITICO primeiro, depois ALERTA, depois INFO
    const peso = { CRITICO: 0, ALERTA: 1, INFO: 2 };
    return todos.sort((a, b) => peso[a.nivel] - peso[b.nivel]);
  }, [pagar, receber, manutencao, funcionarios, checklists]);

  const criticosCount = todosAlertas.filter((a) => a.nivel === 'CRITICO').length;
  const alertasCount = todosAlertas.length;
  const isLoading = loadPagar || loadReceber || loadManut || loadRh || loadChecklists;

  return {
    alertas: todosAlertas,
    total: alertasCount,
    criticos: criticosCount,
    isLoading
  };
}
