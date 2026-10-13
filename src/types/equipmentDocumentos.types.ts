export type TipoDocumentoEquipamento =
  | 'CRLV'
  | 'SEGURO'
  | 'LAUDO_NR12'
  | 'MANUAL_FABRICANTE'
  | 'CERTIFICADO_CALIBRACAO'
  | 'OUTROS';

export interface EquipmentDocumentoItem {
  id: string;
  tenant_id?: string;
  equipamento_id: string;
  nome: string;
  tipo: TipoDocumentoEquipamento;
  orgao_emissor?: string | null;
  data_validade?: string | null;
  drive_url: string;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEquipmentDocumentoDTO {
  equipamento_id: string;
  nome: string;
  tipo: TipoDocumentoEquipamento;
  orgao_emissor?: string;
  data_validade?: string;
  drive_url: string;
  observacoes?: string;
}
