import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { AbastecimentoItem } from '../types/abastecimento.types';
import {
  calcularDeslocamentoEntreServicos,
  type ServicoComDeslocamento,
  type MetricasDeslocamento
} from '../utils/equipmentHorimetroDeslocamento';

export interface EquipmentHistoricoData {
  totalHorasTrabalhadas: number;
  totalHorasDeslocamento: number;
  totalHorasRodadas: number;
  eficienciaFaturamento: number;
  faturamentoTotal: number;
  dieselTotalLitros: number;
  dieselTotalValor: number;
  lucroLiquidoTotal: number;
  margemLucroGeral: number;
  servicos: ServicoHorimetro[];
  servicosDeslocamento: ServicoComDeslocamento[];
  abastecimentos: AbastecimentoItem[];
  operadores: { nome: string; horas: number }[];
}

export function consolidarHistoricoEquipamento(
  servicos: ServicoHorimetro[],
  abastecimentos: AbastecimentoItem[]
): EquipmentHistoricoData {
  const deslocamentoInfo: MetricasDeslocamento = calcularDeslocamentoEntreServicos(servicos);

  const totalHorasTrabalhadas = deslocamentoInfo.totalHorasFaturadas;
  const faturamentoTotal = servicos.reduce((acc, s) => acc + (Number(s.faturamento_bruto) || 0), 0);
  const dieselTotalLitros = abastecimentos.reduce((acc, a) => acc + (Number(a.quantidade_litros) || 0), 0);
  const dieselTotalValor = abastecimentos.reduce((acc, a) => acc + (Number(a.valor_total) || 0), 0);

  const despesasOperador = servicos.reduce((acc, s) => acc + (Number(s.despesa_operador) || 0), 0);
  const despesasManutencao = servicos.reduce((acc, s) => acc + (Number(s.despesa_manutencao) || 0), 0);
  const custosTotais = dieselTotalValor + despesasOperador + despesasManutencao;
  const lucroLiquidoTotal = faturamentoTotal > 0 ? faturamentoTotal - custosTotais : 0;
  const margemLucroGeral = faturamentoTotal > 0 ? (lucroLiquidoTotal / faturamentoTotal) * 100 : 0;

  const opMap = new Map<string, number>();
  servicos.forEach((s) => {
    const nome = s.operador_nome || 'Operador não identificado';
    const horas = Number(s.horas_trabalhadas) || 0;
    opMap.set(nome, (opMap.get(nome) || 0) + horas);
  });
  const operadores = Array.from(opMap.entries())
    .map(([nome, horas]) => ({ nome, horas }))
    .sort((a, b) => b.horas - a.horas);

  return {
    totalHorasTrabalhadas,
    totalHorasDeslocamento: deslocamentoInfo.totalHorasDeslocamento,
    totalHorasRodadas: deslocamentoInfo.totalHorasRodadas,
    eficienciaFaturamento: deslocamentoInfo.eficienciaFaturamento,
    faturamentoTotal,
    dieselTotalLitros,
    dieselTotalValor,
    lucroLiquidoTotal,
    margemLucroGeral,
    servicos,
    servicosDeslocamento: deslocamentoInfo.itens,
    abastecimentos,
    operadores
  };
}
