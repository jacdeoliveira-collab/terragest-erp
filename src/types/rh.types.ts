export type CargoFuncionario =
  | 'OPERADOR_MAQUINA'
  | 'OPERADOR_ESCAVADEIRA'
  | 'OPERADOR_TRATOR'
  | 'MECANICO'
  | 'MOTORISTA';

export type StatusFuncionario = 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';

export interface Funcionario {
  id: string;
  tenant_id?: string;
  nome: string;
  cpf?: string;
  rg?: string;
  cnh?: string;
  validade_cnh?: string;
  endereco_completo?: string;
  ctps?: string;
  aso_validade?: string;
  drive_url_documentos?: string;
  cargo: CargoFuncionario;
  registro_documento?: string;
  validade_documento?: string;
  telefone?: string;
  status: StatusFuncionario;
  salario_base?: number;
  custo_hora_normal?: number;
  valor_hora_extra?: number;
  limite_horas_diario?: number;
  created_at?: string;
  updated_at?: string;
}

export type CreateFuncionarioDTO = Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>;

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
