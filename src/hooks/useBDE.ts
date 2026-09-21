import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useObraContext } from '../contexts/ObraContext';
import type { DailyBulletin } from '../types/bde.types';

export function useBDE() {
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<DailyBulletin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBulletins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('daily_bulletins')
        .select(`
          *,
          equipment:equipment_id (code, name),
          funcionario:operador_id (nome)
        `)
        .order('date', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (obraSelecionada?.id) {
        query = query.eq('obra_id', obraSelecionada.id);
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      interface SupabaseBDEItemWithJoins extends DailyBulletin {
        equipment?: { code: string; name: string };
        funcionario?: { nome: string };
      }

      const formatados: DailyBulletin[] = ((responseData as SupabaseBDEItemWithJoins[]) || []).map((item) => ({
        ...item,
        equipment_code: item.equipment?.code,
        equipment_name: item.equipment?.name,
        operador_nome: item.funcionario?.nome || item.operator_name
      }));

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar boletins de equipamento';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [obraSelecionada]);

  useEffect(() => {
    fetchBulletins();
  }, [fetchBulletins]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBulletins
  };
}
