export interface PontoGraficoHoras {
  data: string;
  horas: number;
}

export interface DashboardMetrics {
  totalHoras: number;
  totalMaquinas: number;
  maquinasAtivas: number;
  operadoresAtivos: number;
  manutencoesAtrasadas: number;
  combustivelTotalLitros: number;
  custoEstimadoTotal: number;
  custoCombustivel: number;
  litrosConsumidos: number;
  custoCombustivelFormatado: string;
  dadosGraficoHoras: PontoGraficoHoras[];
}
