import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Funcionario } from '../types/rh.types';

interface UseFuncionariosOptions {
  onlyActives?: boolean;
}

export function useFuncionarios(options?: UseFuncionariosOptions) {
  const [data, setData] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFuncionarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('rh_funcionarios')
        .select('*')
        .order('nome', { ascending: true });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (options?.onlyActives) {
        query = query.eq('status', 'ATIVO');
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      setData((responseData as Funcionario[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar colaboradores';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [options?.onlyActives]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFuncionarios
  };
}
