import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  limparErro: () => void;
}
