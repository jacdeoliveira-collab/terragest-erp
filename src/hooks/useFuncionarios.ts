import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Funcionario } from '../types/rh.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const getStorageKey = (tId: string) => `terragest_funcionarios_cache_${tId}`;

function getCached(tId: string): Funcionario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface UseFuncionariosOptions {
  onlyActives?: boolean;
}

export function useFuncionarios(options?: UseFuncionariosOptions) {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [data, setData] = useState<Funcionario[]>(() => getCached(activeTenant));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(getCached(activeTenant));
  }, [activeTenant]);

  const fetchFuncionarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const cached = getCached(currentTenant);
      if (cached.length > 0) setData(cached);

      let query = supabase
        .from('rh_funcionarios')
        .select('*')
        .order('nome', { ascending: true });

      query = aplicarFiltroTenant(query, currentTenant);

      if (options?.onlyActives) {
        query = query.eq('status', 'ATIVO');
      }

      const { data: responseData, error: responseError } = await query;
      if (responseError) throw new Error(responseError.message);

      const lista = (responseData as unknown as Funcionario[]) || [];
      setData(lista);
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(currentTenant), JSON.stringify(lista));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar colaboradores');
      setData(getCached(tenantAtivoId || DEFAULT_LEGACY_TENANT));
    } finally {
      setIsLoading(false);
    }
  }, [options?.onlyActives, tenantAtivoId]);

  const inativarFuncionario = async (id: string, novoStatus: 'ATIVO' | 'INATIVO' = 'INATIVO') => {
    try {
      const { error: err } = await supabase
        .from('rh_funcionarios')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (err) throw new Error(err.message);
      setData((prev) => prev.map((f) => (f.id === id ? { ...f, status: novoStatus } : f)));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar status' };
    }
  };

  const atualizarFuncionario = async (id: string, payload: Partial<Funcionario>) => {
    try {
      const { data: updated, error: err } = await supabase
        .from('rh_funcionarios')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      setData((prev) => prev.map((f) => (f.id === id ? (updated as Funcionario) : f)));
      return { success: true, data: updated };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar' };
    }
  };

  const configurarPin = async (id: string, pin: string) => {
    try {
      const cleanPin = pin.trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return { success: false, error: 'O PIN deve conter exatamente 4 números.' };
      }
      const { error: err } = await supabase
        .from('rh_funcionarios')
        .update({ pin_assinatura: cleanPin, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (err) throw new Error(err.message);
      setData((prev) => prev.map((f) => (f.id === id ? { ...f, pin_assinatura: cleanPin } : f)));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao salvar PIN' };
    }
  };

  useEffect(() => { fetchFuncionarios(); }, [fetchFuncionarios]);

  return {
    data, isLoading, error, refetch: fetchFuncionarios,
    inativarFuncionario, atualizarFuncionario, configurarPin
  };
}
