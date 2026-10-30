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

export interface OrcamentoMaquinaItem {
  id: string;
  maquina_id?: string;
  maquina_nome: string;
  maquina_codigo?: string;
  maquina_modelo?: string;
  maquina_ano?: string | number;
  maquina_potencia?: string | number;
  maquina_chassi?: string;
  maquina_horimetro_saida?: number;
  implemento?: string;
  operador_nome?: string;
  franquia_minima?: string;
  horas_estimadas: number;
  valor_hora: number;
  subtotal: number;
}

export interface OrcamentoDetalhesProposta {
  local_obra?: string;
  obra_id?: string;
  obra_nome?: string;
  tipo_operacao?: string;
  tipo_terreno?: string;
  regime_trabalho?: string;
  previsao_inicio?: string;
  valor_mobilizacao?: number;
  valor_hora_parada?: number;
  valor_desconto?: number;
  operador_incluso?: boolean;
  combustivel_termo?: string;
  mobilizacao_termo?: string;
  alimentacao_hospedagem_termo?: string;
  guarda_vigilancia_termo?: string;
  observacoes_livres?: string;
  maquinas_itens?: OrcamentoMaquinaItem[];
}

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
  detalhes_proposta?: OrcamentoDetalhesProposta;
  created_at?: string;
  updated_at?: string;
  // Campos cruzados (joins em memória com dados reais da máquina e cliente)
  cliente_nome?: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  cliente_endereco?: string;
  maquina_nome?: string;
  maquina_codigo?: string;
  maquina_modelo?: string;
  maquina_serie?: string;
  maquina_placa?: string;
  maquina_ano?: number;
  maquina_potencia?: number;
  maquina_horimetro_atual?: number;
  maquina_combustivel?: string;
  maquina_capacidade_tanque?: number;
  maquina_foto_url?: string;
  conta_bancaria_nome?: string;
  conta_bancaria_pix?: string;
  conta_bancaria_banco?: string;
}

export type CreateOrcamentoDTO = Omit<
  Orcamento,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'cliente_nome'
  | 'cliente_documento'
  | 'cliente_telefone'
  | 'cliente_endereco'
  | 'maquina_nome'
  | 'maquina_codigo'
  | 'maquina_modelo'
  | 'maquina_serie'
  | 'maquina_placa'
  | 'maquina_ano'
  | 'maquina_potencia'
  | 'maquina_horimetro_atual'
  | 'maquina_combustivel'
  | 'maquina_capacidade_tanque'
  | 'maquina_foto_url'
  | 'conta_bancaria_nome'
  | 'conta_bancaria_pix'
  | 'conta_bancaria_banco'
>;
