export type StatusContaPagar = 'PENDENTE' | 'PAGO' | 'CANCELADO';

export type CategoriaContaPagar =
  | 'COMBUSTIVEL'
  | 'PECAS_MANUTENCAO'
  | 'LOCACAO_EQUIPAMENTOS'
  | 'FOLHA_RH'
  | 'ADMINISTRATIVO'
  | 'OUTROS';

export type FormaPagamentoDespesa = 'PIX' | 'BOLETO' | 'TED' | 'TRANSFERENCIA' | 'CARTAO' | 'OUTRO';

export interface ContaPagarItem {
  id: string;
  tenant_id?: string;
  obra_id?: string;
  obra_nome?: string;
  descricao: string;
  fornecedor: string;
  categoria: CategoriaContaPagar | string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: FormaPagamentoDespesa | string;
  conta_bancaria_id?: string;
  conta_bancaria_nome?: string;
  condicao_pagamento?: string;
  chave_pix_fornecedor?: string;
  tipo_chave_pix_fornecedor?: string;
  status: StatusContaPagar;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContaPagarDTO {
  obra_id?: string;
  descricao: string;
  fornecedor: string;
  categoria: CategoriaContaPagar | string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: FormaPagamentoDespesa | string;
  conta_bancaria_id?: string;
  condicao_pagamento?: string;
  chave_pix_fornecedor?: string;
  tipo_chave_pix_fornecedor?: string;
  observacoes?: string;
}
