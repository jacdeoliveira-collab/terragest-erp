export type ModuloChave = 
  | 'FROTA'
  | 'BDE'
  | 'OBRAS'
  | 'RH'
  | 'REGULATORY_MAPA';

export interface TenantModulo {
  id: string;
  tenant_id: string;
  modulo_chave: ModuloChave;
  nome_exibicao: string;
  icone_chave: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItemAutorizado {
  id: string;
  moduloChave: ModuloChave;
  label: string;
  icone: string;
  ordem: number;
}
