import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AbastecimentoItem } from '../types/abastecimento.types';

export function useAbastecimentos() {
  const [data, setData] = useState<AbastecimentoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbastecimentos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('abastecimentos')
        .select(`
          *,
          equipment:maquina_id (code, name)
        `)
        .order('data', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      interface SupabaseAbastecimentoRaw extends AbastecimentoItem {
        equipment?: { code: string; name: string };
      }

      const formatados: AbastecimentoItem[] = ((responseData as SupabaseAbastecimentoRaw[]) || []).map((item) => ({
        ...item,
        maquina_codigo: item.equipment?.code,
        maquina_nome: item.equipment?.name
      }));

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar abastecimentos';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbastecimentos();
  }, [fetchAbastecimentos]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAbastecimentos
  };
}
