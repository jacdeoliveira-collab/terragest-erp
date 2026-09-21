export type StatusObra = 'ATIVA' | 'EM_ANDAMENTO' | 'PARALISADA' | 'CONCLUIDA';

export interface Obra {
  id: string;
  tenant_id?: string;
  nome: string;
  cliente?: string;
  localizacao?: string;
  data_inicio?: string;
  status: StatusObra;
  created_at?: string;
  updated_at?: string;
}

export type CreateObraDTO = Omit<Obra, 'id' | 'created_at' | 'updated_at'>;
