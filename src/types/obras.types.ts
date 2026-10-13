export type StatusObra = 'NAO_INICIADA' | 'EM_ANDAMENTO' | 'PARALISADA' | 'CONCLUIDA' | 'ATIVA';

export interface Obra {
  id: string;
  tenant_id?: string;
  nome: string;
  cliente_nome?: string;
  cliente?: string;
  cliente_cnpj?: string;
  cno?: string;
  art_crea?: string;
  endereco_completo?: string;
  localizacao?: string;
  data_inicio?: string;
  previsao_termino?: string;
  status: StatusObra;
  created_at?: string;
  updated_at?: string;
}

export type CreateObraDTO = Omit<Obra, 'id' | 'created_at' | 'updated_at'>;

export * from './obraDocumentos.types';

