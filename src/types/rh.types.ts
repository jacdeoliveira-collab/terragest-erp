export type CargoFuncionario =
  | 'OPERADOR_MAQUINA'
  | 'OPERADOR_ESCAVADEIRA'
  | 'OPERADOR_TRATOR'
  | 'MECANICO'
  | 'MOTORISTA';

export type StatusFuncionario = 'ATIVO' | 'INATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';
export type StatusConviteAcesso = 'NAO_CONVIDADO' | 'PENDENTE' | 'ATIVO';

export interface Funcionario {
  id: string;
  tenant_id?: string;
  nome: string;
  cpf?: string;
  rg?: string;
  cnh?: string;
  validade_cnh?: string;
  vencimento_cnh?: string;
  endereco_completo?: string;
  ctps?: string;
  pis_pasep?: string;
  titulo_eleitor?: string;
  reservista?: string;
  aso_validade?: string;
  vencimento_aso?: string;
  drive_url_documentos?: string;
  cargo: CargoFuncionario;
  registro_documento?: string;
  validade_documento?: string;
  telefone?: string;
  email_acesso?: string;
  auth_user_id?: string;
  status_convite?: StatusConviteAcesso;
  pin_assinatura?: string;
  status: StatusFuncionario;
  salario_base?: number;
  custo_hora_normal?: number;
  valor_hora_extra?: number;
  limite_horas_diario?: number;
  dia_pagamento?: number;
  dia_fechamento?: number;
  created_at?: string;
  updated_at?: string;
}

export type CreateFuncionarioDTO = Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>;

export interface EpiEntregue {
  id: string;
  tenant_id?: string;
  funcionario_id: string;
  descricao_equipamento: string;
  numero_ca: string;
  data_entrega: string;
  quantidade: number;
  motivo?: string;
  termo_assinado?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateEpiDTO = Omit<EpiEntregue, 'id' | 'created_at' | 'updated_at'>;

export interface ExtratoBancoHoras {
  funcionarioId: string;
  nome: string;
  cargo: string;
  totalHorasMes: number;
  limiteMensal: number;
  saldoHoras: number;
  horasExtras: number;
  custoEstimadoExtra: number;
  valorHoraExtra: number;
  statusSaldo: 'POSITIVO' | 'ESTOURO';
}

export interface ItemComissaoOperador {
  operadorId: string;
  operadorNome: string;
  cargo?: string;
  documento?: string;
  maquinasOperadas: string[];
  totalHorasTrabalhadas: number;
  valorHoraComissao: number;
  totalPagar: number;
  quantidadeBoletins: number;
}

