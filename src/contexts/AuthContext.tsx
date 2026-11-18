import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserTenantData } from './authTenantHelper';
import type { AuthContextType, AuthUser, PerfilAcesso } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        if (perfil === 'BLOQUEADO') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          throw new Error('Seu acesso está bloqueado pelo administrador da empresa.');
        }
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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('terragest_manual_logout', '1');
        localStorage.removeItem('terragest_tenant_ativo_id');
      }
      await supabase.auth.signOut();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao encerrar sessão';
      setError(msg);
    } finally {
      setUser(null);
      setSession(null);
      setPerfilAcesso('ADMIN');
      setLoading(false);
    }
  }, []);

  const limparErro = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, session, perfil_acesso: perfilAcesso, loading, error, login, logout, limparErro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext deve ser utilizado dentro de um AuthProvider');
  return context;
};
