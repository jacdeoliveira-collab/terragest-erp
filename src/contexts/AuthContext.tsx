import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserTenantData } from './authTenantHelper';
import { isErroRedeOffline, lerSessaoOffline, salvarSessaoOffline, validarLoginOffline } from '../services/offlineAuthService';
import type { AuthContextType, AuthUser, PerfilAcesso } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfilAcesso, setPerfilAcesso] = useState<PerfilAcesso>('ADMIN');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const restaurarOfflineSePermitido = useCallback(() => {
    const manualLogout = typeof window !== 'undefined' && sessionStorage.getItem('terragest_manual_logout') === '1';
    if (manualLogout || (typeof navigator !== 'undefined' && navigator.onLine)) return null;
    const snap = lerSessaoOffline();
    if (!snap) return null;
    if (snap.tenantId && typeof window !== 'undefined') localStorage.setItem('terragest_tenant_ativo_id', snap.tenantId);
    setUser(snap.user); setPerfilAcesso(snap.perfil);
    return { perfil: snap.perfil, tenantId: snap.tenantId };
  }, []);

  const initUserWithProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      const offline = restaurarOfflineSePermitido();
      if (offline) return offline;
      setSession(null); setUser(null); setPerfilAcesso('ADMIN');
      return { perfil: 'ADMIN' as PerfilAcesso, tenantId: null };
    }
    const { perfil, tenantId } = await fetchUserTenantData(currentSession.user);
    if (tenantId && typeof window !== 'undefined') localStorage.setItem('terragest_tenant_ativo_id', tenantId);
    const enrichedUser: AuthUser = Object.assign(currentSession.user, { perfil_acesso: perfil });
    setSession(currentSession); setUser(enrichedUser); setPerfilAcesso(perfil);
    await salvarSessaoOffline(enrichedUser, perfil, tenantId);
    return { perfil, tenantId };
  }, [restaurarOfflineSePermitido]);

  useEffect(() => {
    const isRecoveryHash = typeof window !== 'undefined' && window.location.hash.includes('type=recovery');
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (isRecoveryHash && typeof window !== 'undefined' && window.location.pathname !== '/redefinir-senha') {
          window.location.replace(`/redefinir-senha${window.location.hash}`);
          return;
        }
        return initUserWithProfile(currentSession);
      })
      .catch(() => { restaurarOfflineSePermitido(); })
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      await initUserWithProfile(newSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY' && typeof window !== 'undefined' && window.location.pathname !== '/redefinir-senha') {
        window.location.replace('/redefinir-senha');
      }
    });

    return () => subscription.unsubscribe();
  }, [initUserWithProfile, restaurarOfflineSePermitido]);

  const login = useCallback(async (email: string, pass: string) => {
    const entrarOffline = async () => {
      const snap = await validarLoginOffline(email, pass);
      if (!snap) throw new Error('Sem conexão com a internet. Conecte-se ao menos uma vez com este usuário para liberar o acesso offline.');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('terragest_manual_logout');
        if (snap.tenantId) localStorage.setItem('terragest_tenant_ativo_id', snap.tenantId);
      }
      setUser(snap.user);
      setPerfilAcesso(snap.perfil);
      return { perfil_acesso: snap.perfil, tenant_id: snap.tenantId };
    };
    try {
      setLoading(true);
      setError(null);
      if (typeof navigator !== 'undefined' && !navigator.onLine) return await entrarOffline();
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (signInError) {
        if (isErroRedeOffline(signInError)) return await entrarOffline();
        throw signInError;
      }
      if (authData.session) {
        const { perfil, tenantId } = await initUserWithProfile(authData.session);
        if (perfil === 'BLOQUEADO') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          throw new Error('Seu acesso está bloqueado pelo administrador da empresa.');
        }
        const enrichedUser: AuthUser = Object.assign(authData.session.user, { perfil_acesso: perfil });
        await salvarSessaoOffline(enrichedUser, perfil, tenantId, { email, password: pass });
        if (tenantId && typeof window !== 'undefined') localStorage.setItem('terragest_tenant_ativo_id', tenantId);
        return { perfil_acesso: perfil, tenant_id: tenantId };
      }
      return { perfil_acesso: 'ADMIN' as PerfilAcesso, tenant_id: null };
    } catch (err: unknown) {
      if (isErroRedeOffline(err)) {
        try { return await entrarOffline(); } catch (offErr: unknown) {
          const msgOff = offErr instanceof Error ? offErr.message : 'Sem conexão com a internet.';
          setError(msgOff);
          throw offErr;
        }
      }
      const rawMsg = err instanceof Error ? err.message : 'Falha ao autenticar usuário';
      const lower = rawMsg.toLowerCase();
      setError(
        lower.includes('invalid login credentials') ? 'E-mail ou senha incorretos. Confira os dados ou clique em "Esqueci a senha".'
        : lower.includes('email not confirmed') ? 'E-mail ainda não confirmado. Verifique sua caixa de entrada ou contate o administrador.'
        : rawMsg
      );
      throw err;
    } finally { setLoading(false); }
  }, [initUserWithProfile]);

  const logout = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('terragest_manual_logout', '1');
        localStorage.removeItem('terragest_tenant_ativo_id');
      }
      if (typeof navigator === 'undefined' || navigator.onLine) await supabase.auth.signOut();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao encerrar sessão');
    } finally {
      setUser(null); setSession(null); setPerfilAcesso('ADMIN'); setLoading(false);
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
