import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthContextType, AuthUser, PerfilAcesso } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserTenantData(user: User): Promise<{ perfil: PerfilAcesso; tenantId: string | null }> {
  try {
    const { data } = await supabase
      .from('tenant_users')
      .select('perfil_acesso, tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        perfil: (data.perfil_acesso as PerfilAcesso) || 'ADMIN',
        tenantId: data.tenant_id || null
      };
    }
  } catch {
    // fallback
  }
  return {
    perfil: (user.user_metadata?.perfil_acesso as PerfilAcesso) || 'ADMIN',
    tenantId: user.user_metadata?.tenant_id || null
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfilAcesso, setPerfilAcesso] = useState<PerfilAcesso>('ADMIN');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initUserWithProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setPerfilAcesso('ADMIN');
      return { perfil: 'ADMIN' as PerfilAcesso, tenantId: null };
    }
    const { perfil, tenantId } = await fetchUserTenantData(currentSession.user);
    if (tenantId && typeof window !== 'undefined') {
      localStorage.setItem('terragest_tenant_ativo_id', tenantId);
    }
    const enrichedUser: AuthUser = Object.assign(currentSession.user, { perfil_acesso: perfil });
    setSession(currentSession);
    setUser(enrichedUser);
    setPerfilAcesso(perfil);
    return { perfil, tenantId };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      initUserWithProfile(currentSession).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      await initUserWithProfile(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initUserWithProfile]);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (signInError) throw signInError;
      if (authData.session) {
        const { perfil, tenantId } = await initUserWithProfile(authData.session);
        if (tenantId && typeof window !== 'undefined') {
          localStorage.setItem('terragest_tenant_ativo_id', tenantId);
        }
        return { perfil_acesso: perfil, tenant_id: tenantId };
      }
      return { perfil_acesso: 'ADMIN' as PerfilAcesso, tenant_id: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar usuário';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initUserWithProfile]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setSession(null);
      setPerfilAcesso('ADMIN');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('terragest_tenant_ativo_id');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao encerrar sessão';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const limparErro = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        perfil_acesso: perfilAcesso,
        loading,
        error,
        login,
        logout,
        limparErro
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
