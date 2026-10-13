import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useObraContext } from '../contexts/ObraContext';
import { useTenantContext } from '../contexts/TenantContext';
import type { DailyBulletin } from '../types/bde.types';

export function useBDE() {
  const { obraSelecionada } = useObraContext();
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<DailyBulletin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBulletins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let query = supabase
        .from('daily_bulletins')
        .select('*')
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
        status_aprovacao: item.status_aprovacao || 'PENDENTE',
        horas_produtivas: Number(item.horas_produtivas) || Number(item.total_hours) || 0,
        horas_ociosas: Number(item.horas_ociosas) || 0,
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
  }, [obraSelecionada, tenantAtivoId]);

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
