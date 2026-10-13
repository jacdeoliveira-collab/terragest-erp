import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { EpiEntregue, CreateEpiDTO } from '../types/rh.types';

export function useEpis(funcionarioId?: string) {
  const [epis, setEpis] = useState<EpiEntregue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpis = useCallback(async () => {
    if (!funcionarioId) {
      setEpis([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('epis_entregues')
        .select('*')
        .eq('funcionario_id', funcionarioId)
        .order('data_entrega', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error: err } = await query;
      if (err) throw new Error(err.message);
      setEpis((data as EpiEntregue[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar EPIs');
      setEpis([]);
    } finally {
      setIsLoading(false);
    }
  }, [funcionarioId]);

  const registrarEpi = async (dto: CreateEpiDTO) => {
    try {
      const { data, error: err } = await supabase
        .from('epis_entregues')
        .insert([dto])
        .select()
        .single();

      if (err) throw new Error(err.message);
      setEpis((prev) => [data as EpiEntregue, ...prev]);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao registrar EPI' };
    }
  };

  useEffect(() => {
    fetchEpis();
  }, [fetchEpis]);

  return {
    epis,
    isLoading,
    error,
    refetch: fetchEpis,
    registrarEpi
  };
}
