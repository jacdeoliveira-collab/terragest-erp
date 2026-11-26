export type StatusCentroCusto = 'EM_ANDAMENTO' | 'ATIVA' | 'PARALISADA' | 'CONCLUIDA' | 'NAO_INICIADA';

export interface CentroCusto {
  id: string;
  tenant_id?: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  cliente?: string;
  cliente_nome?: string;
  data_registro?: string;
  data_inicio?: string;
  ano_safra?: string;
  status: StatusCentroCusto;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCentroCustoDTO {
  nome: string;
  descricao?: string;
  cliente?: string;
  data_registro: string;
  ano_safra: string;
  status?: StatusCentroCusto;
}

export interface CentroCustoDreResumo {
  custoTotalGeral: number;
  receitaTotal: number;
  lucroOperacional: number;
  margemLucro: number;
  totalManutencao: number;
  totalPecas: number;
  totalMaoObra: number;
  totalCombustivel: number;
  totalLitrosCombustivel: number;
  totalOutrasDespesas: number;
  totalFolha: number;
  qtdAbastecimentos: number;
}
