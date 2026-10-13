export type StatusOrcamento = 'PENDENTE' | 'APROVADO' | 'CONCLUIDO';

export interface Cliente {
  id: string;
  tenant_id?: string;
  nome: string;
  documento?: string; // CPF ou CNPJ
  telefone?: string;
  endereco?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateClienteDTO = Omit<Cliente, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClienteDTO = Partial<CreateClienteDTO>;

export interface Orcamento {
  id: string;
  tenant_id?: string;
  cliente_id: string;
  maquina_id?: string;
  descricao_servico: string;
  valor_hora: number;
  horas_estimadas: number;
  valor_total: number;
  status: StatusOrcamento;
  data_proposta?: string;
  validade_dias?: number;
  observacoes?: string;
  valor_adiantamento?: number;
  data_adiantamento?: string;
  forma_pagamento_adiantamento?: string;
  saldo_restante?: number;
  condicao_pagamento?: string;
  forma_pagamento?: string;
  conta_bancaria_id?: string;
  prazo_descricao?: string;
  data_vencimento?: string;
  chave_pix_manual?: string;
  created_at?: string;
  updated_at?: string;
  // Campos cruzados (joins em memória)
  cliente_nome?: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  maquina_nome?: string;
  maquina_codigo?: string;
  conta_bancaria_nome?: string;
  conta_bancaria_pix?: string;
  conta_bancaria_banco?: string;
}

export type CreateOrcamentoDTO = Omit<
  Orcamento,
  'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_documento' | 'cliente_telefone' | 'maquina_nome' | 'maquina_codigo' | 'conta_bancaria_nome' | 'conta_bancaria_pix' | 'conta_bancaria_banco'
>;

