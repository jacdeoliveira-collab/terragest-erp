export type PeriodoGestaoBI = 'MES_ATUAL' | '30D' | '90D' | 'ANO' | 'TUDO' | 'PERSONALIZADO';

export interface GestaoBIFiltros {
  periodo: PeriodoGestaoBI;
  dataInicio: string;
  dataFim: string;
  maquinaId: string;
  clienteNome: string;
  operadorNome: string;
  centroCustoId: string;
}

export interface GestaoBIKpis {
  horasTrabalhadas: number;
  receitaTotal: number;
  receitaRecebida: number;
  saldoAReceber: number;
  custoDiesel: number;
  litrosDiesel: number;
  custoOperadores: number;
  custoManutencao: number;
  outrosCustos: number;
  custoTotal: number;
  custosPagos: number;
  lucroLiquido: number;
  margemPercent: number;
  receitaPorHora: number;
  custoPorHora: number;
  litrosPorHora: number;
  qtdServicos: number;
}

export interface MaquinaDREItem {
  id: string;
  nome: string;
  horas: number;
  receita: number;
  dieselValor: number;
  dieselLitros: number;
  litrosHora: number;
  manutencao: number;
  operador: number;
  lucro: number;
  margemPercent: number;
}

export interface ClienteRankingItem {
  nome: string;
  horas: number;
  faturado: number;
  recebido: number;
  emAberto: number;
  qtdServicos: number;
}

export interface OperadorRankingItem {
  nome: string;
  horas: number;
  receitaGerada: number;
  ganhos: number;
  valesPagos: number;
  saldoAPagar: number;
}

export interface CentroCustoRankingItem {
  id: string;
  nome: string;
  receita: number;
  custo: number;
  lucro: number;
  margemPercent: number;
}

export interface GestaoBIRadar {
  agendaNaFila: number;
  agendaHorasPrevistas: number;
  manutencoesVencidas: number;
  manutencoesProximas: number;
  frotasAtivas: number;
  totalFrota: number;
  centrosAtivos: number;
}

export interface GestaoBIOpcoesFiltro {
  maquinas: { id: string; label: string }[];
  clientes: string[];
  operadores: string[];
  centrosCusto: { id: string; nome: string }[];
}

export interface GestaoBIResult {
  kpis: GestaoBIKpis;
  porMaquina: MaquinaDREItem[];
  porCliente: ClienteRankingItem[];
  porOperador: OperadorRankingItem[];
  porCentroCusto: CentroCustoRankingItem[];
  radar: GestaoBIRadar;
  opcoes: GestaoBIOpcoesFiltro;
}
