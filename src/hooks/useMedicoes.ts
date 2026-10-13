import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { MedicaoItem, StatusPagamentoMedicao } from '../types/faturamento.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useMedicoes() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<MedicaoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicoes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;

      let q = supabase
        .from('medicoes')
        .select('*')
        .order('created_at', { ascending: false });

      q = aplicarFiltroTenant(q, currentTenant);
      if (obraSelecionada?.id) {
        q = q.or(`obra_id.eq.${obraSelecionada.id},obra_id.is.null`);
      }

      const [medRes, obrasRes] = await Promise.all([
        q,
        supabase.from('obras').select('id, nome, cliente_nome, cliente')
      ]);

      if (medRes.error) {
        console.warn('[useMedicoes] Aviso na consulta:', medRes.error.message);
      }

      const obrasMap = new Map((obrasRes.data || []).map((o) => [o.id, o]));

      const formatados: MedicaoItem[] = (medRes.data || []).map((item) => {
        const o = obrasMap.get(item.obra_id);
        return {
          ...item,
          competencia: item.competencia || item.created_at?.slice(0, 7) || '',
          numero_medicao: item.numero_medicao || '',
          status_pagamento: item.status_pagamento || item.status || 'AGUARDANDO_PAGAMENTO',
          obra_nome: o?.nome || '—',
          cliente_nome: o?.cliente_nome || o?.cliente || '—'
        };
      });

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar medições';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  const atualizarStatusPagamento = async (id: string, novoStatus: StatusPagamentoMedicao) => {
    try {
      const { error: updErr } = await supabase
        .from('medicoes')
        .update({ status_pagamento: novoStatus })
        .eq('id', id);

      if (updErr) throw new Error(updErr.message);
      await fetchMedicoes();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar status da medição';
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchMedicoes();
  }, [fetchMedicoes]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMedicoes,
    atualizarStatusPagamento
  };
}
