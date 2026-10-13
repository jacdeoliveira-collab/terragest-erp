import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { MedicaoItem, FormaPagamentoTitulo } from '../types/faturamento.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { unificarTitulosReceber, liquidarTituloReceber, lancarHaverReceber } from '../services/contasReceberSyncService';
import { excluirTituloReceber } from '../services/contasReceberExcluirService';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useContasReceber() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<MedicaoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContasReceber = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;

      let qMed = supabase.from('medicoes').select('*').order('created_at', { ascending: false });
      let qServ = supabase.from('servicos_horimetro').select('*').order('created_at', { ascending: false });

      qMed = aplicarFiltroTenant(qMed, currentTenant);
      qServ = aplicarFiltroTenant(qServ, currentTenant);

      if (obraSelecionada?.id) {
        qMed = qMed.or(`obra_id.eq.${obraSelecionada.id},obra_id.is.null`);
      }

      const [medRes, servRes, obrasRes] = await Promise.all([
        qMed,
        qServ,
        supabase.from('obras').select('id, nome, cliente_nome, cliente')
      ]);

      let servicosLista: ServicoHorimetro[] = servRes.data || [];

      // Fallback local se o banco ainda não sincronizou ou offline
      try {
        const cached = localStorage.getItem(`terragest_servicos_horimetro_${currentTenant}`);
        if (cached) {
          const localServicos = JSON.parse(cached) as ServicoHorimetro[];
          if (Array.isArray(localServicos)) {
            servicosLista = servicosLista.map((remoto) => {
              const local = localServicos.find((l) => l.id === remoto.id);
              if (local?.parcelas && local.parcelas.length > 0 && (!remoto.parcelas || remoto.parcelas.length === 0)) {
                return { ...remoto, parcelas: local.parcelas };
              }
              return remoto;
            });
            const idsRemotos = new Set(servicosLista.map((s) => s.id));
            const novosLocais = localServicos.filter((s) => !idsRemotos.has(s.id));
            servicosLista = [...servicosLista, ...novosLocais];
          }
        }
      } catch {}

      const obrasMap = new Map((obrasRes.data || []).map((o) => [o.id, o]));
      const unificados = unificarTitulosReceber(
        medRes.data || [],
        servicosLista,
        obrasMap,
        obraSelecionada?.id
      );

      setData(unificados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar contas a receber';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  const darBaixa = async (
    id: string,
    data_pagamento: string,
    forma_pagamento: FormaPagamentoTitulo | string,
    conta_bancaria_id?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await liquidarTituloReceber(id, data_pagamento, forma_pagamento, conta_bancaria_id);
    if (res.success) {
      await fetchContasReceber();
    }
    return res;
  };

  const registrarHaver = async (
    id: string,
    valor: number,
    data: string,
    forma: string,
    obs?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await lancarHaverReceber(id, valor, data, forma, obs);
    if (res.success) {
      await fetchContasReceber();
    }
    return res;
  };

  const excluirTitulo = async (item: MedicaoItem): Promise<{ success: boolean; error?: string }> => {
    setData((prev) => prev.filter((t) => t.id !== item.id && (!item.numero_medicao || t.numero_medicao !== item.numero_medicao)));
    const res = await excluirTituloReceber(item);
    await fetchContasReceber();
    return res;
  };

  useEffect(() => {
    fetchContasReceber();
  }, [fetchContasReceber]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchContasReceber,
    darBaixa,
    registrarHaver,
    excluirTitulo
  };
}
