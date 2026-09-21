import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ChecklistItem } from '../types/checklist.types';

export function useChecklists() {
  const [data, setData] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('checklists_diarios')
        .select(`
          *,
          equipment:maquina_id (code, name),
          funcionario:operador_id (nome)
        `)
        .order('data', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      interface SupabaseChecklistRaw extends ChecklistItem {
        equipment?: { code: string; name: string };
        funcionario?: { nome: string };
      }

      const formatados: ChecklistItem[] = ((responseData as SupabaseChecklistRaw[]) || []).map((item) => ({
        ...item,
        maquina_codigo: item.equipment?.code,
        maquina_nome: item.equipment?.name,
        operador_nome: item.funcionario?.nome
      }));

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar checklists';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchChecklists
  };
}
