import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (signInError) throw signInError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar usuário';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao encerrar sessão';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const limparErro = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, session, loading, error, login, logout, limparErro }}>
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
