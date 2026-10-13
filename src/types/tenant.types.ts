import type { PerfilAcesso } from './auth.types';

export type StatusContaTenant = 'ativo' | 'bloqueado' | 'teste';
export type TipoPlanoTenant = 'START' | 'PRO' | 'ENTERPRISE';

export interface TenantMaster {
  id: string;
  nome: string;
  razao_social?: string;
  cnpj?: string;
  endereco?: string;
  slogan?: string;
  logo_url?: string;
  assinatura_digital_url?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  responsavel_tecnico?: string;
  registro_crea?: string;
  plano?: TipoPlanoTenant;
  plano_valor: number;
  valor_mensalidade?: number;
  admin_email?: string;
  limite_usuarios?: number;
  data_vencimento_fatura?: number | string;
  status_conta: StatusContaTenant;
  assinatura_inicio?: string;
  assinatura_fim?: string;
  contato_email?: string;
  contato_telefone?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateTenantDTO = {
  nome: string;
  cnpj?: string;
  slogan?: string;
  logo_url?: string;
  plano?: TipoPlanoTenant;
  plano_valor?: number;
  valor_mensalidade?: number;
  admin_email?: string;
  limite_usuarios?: number;
  data_vencimento_fatura?: number | string;
  status_conta?: StatusContaTenant;
  assinatura_inicio?: string;
  assinatura_fim?: string;
  meses_contrato?: number;
  contato_email?: string;
  contato_telefone?: string;
};

export type UpdateTenantDTO = Partial<Omit<TenantMaster, 'id' | 'created_at' | 'updated_at'>>;

export interface TenantUserItem {
  id: string;
  nome: string;
  razao_social: string;
  status_conta?: StatusContaTenant;
  role?: string;
  perfil_acesso?: PerfilAcesso;
  logo_url?: string;
}

export interface EmpresaConfigPayload {
  razao_social: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  contato_telefone: string;
  contato_email: string;
  endereco: string;
  responsavel_tecnico?: string;
  registro_crea?: string;
  logo_url?: string | null;
  assinatura_digital_url?: string | null;
}
