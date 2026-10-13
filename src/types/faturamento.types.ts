export type StatusPagamentoMedicao = 'AGUARDANDO_PAGAMENTO' | 'PAGO_PARCIAL' | 'PAGO' | 'CANCELADO';

export type FormaPagamentoTitulo = 'PIX' | 'BOLETO' | 'TED' | 'TRANSFERENCIA' | 'DINHEIRO' | 'OUTRO';

export interface MedicaoItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  obra_nome?: string;
  cliente_nome?: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  servico_id?: string;
  competencia: string; // Ex: '2026-09'
  numero_medicao: string;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: FormaPagamentoTitulo | string;
  conta_bancaria_id?: string;
  conta_bancaria_nome?: string;
  condicao_pagamento?: string;
  total_horas_produtivas: number;
  valor_total: number;
  valor_adiantamento?: number;
  saldo_restante?: number;
  adiantamentos_historico?: any[];
  status_pagamento: StatusPagamentoMedicao;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BDEItemMedicao {
  id: string;
  date: string;
  equipment_id: string;
  equipment_code?: string;
  equipment_name?: string;
  operador_nome?: string;
  horas_produtivas: number;
  valor_hora_equipamento: number;
  subtotal_calculado: number;
}

export interface CreateMedicaoDTO {
  obra_id: string;
  competencia: string;
  numero_medicao?: string;
  data_emissao: string;
  data_vencimento: string;
  total_horas_produtivas: number;
  valor_total: number;
  status_pagamento?: StatusPagamentoMedicao;
  observacoes?: string;
  bde_ids: string[];
}
