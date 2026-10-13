export type TipoDocumentoFuncionario =
  | 'CNH'
  | 'ASO'
  | 'FICHA_EPI'
  | 'TREINAMENTO_NR'
  | 'CONTRATO'
  | 'CERTIFICADO'
  | 'OUTROS';

export interface FuncionarioDocumentoItem {
  id: string;
  tenant_id?: string;
  funcionario_id: string;
  nome: string;
  tipo: TipoDocumentoFuncionario;
  orgao_emissor?: string | null;
  data_validade?: string | null;
  drive_url: string;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFuncionarioDocumentoDTO {
  funcionario_id: string;
  nome: string;
  tipo: TipoDocumentoFuncionario;
  orgao_emissor?: string;
  data_validade?: string;
  drive_url: string;
  observacoes?: string;
}
