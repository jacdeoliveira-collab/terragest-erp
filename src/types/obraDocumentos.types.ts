export type TipoDocumentoObra =
  | 'ART'
  | 'CNO'
  | 'ALVARA'
  | 'LICENCA_AMBIENTAL'
  | 'ASV'
  | 'OUTORGA_AGUA'
  | 'PGR'
  | 'LTCAT'
  | 'PCMSO'
  | 'OUTROS';

export interface ObraDocumentoItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  nome: string;
  tipo: TipoDocumentoObra;
  orgao_emissor?: string | null;
  data_validade?: string | null;
  drive_url: string;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateObraDocumentoDTO {
  obra_id: string;
  nome: string;
  tipo: TipoDocumentoObra;
  orgao_emissor?: string;
  data_validade?: string;
  drive_url: string;
  observacoes?: string;
}
