import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { ChecklistItem } from '../types/checklist.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useChecklists() {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;

      let query = supabase
        .from('checklists_diarios')
        .select(`
          *,
          equipment:maquina_id (code, name),
          funcionario:operador_id (nome)
        `)
        .order('data', { ascending: false });

      query = aplicarFiltroTenant(query, currentTenant);

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
  }, [tenantAtivoId]);

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
