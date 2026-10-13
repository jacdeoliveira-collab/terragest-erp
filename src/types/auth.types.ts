import type { User, Session } from '@supabase/supabase-js';

export type PerfilAcesso = 'ADMIN' | 'FINANCEIRO' | 'RH' | 'ENGENHARIA' | 'OPERACIONAL';

export interface AuthUser extends User {
  perfil_acesso?: PerfilAcesso;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  perfil_acesso?: PerfilAcesso;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ perfil_acesso: PerfilAcesso; tenant_id: string | null }>;
  logout: () => Promise<void>;
  limparErro: () => void;
}
