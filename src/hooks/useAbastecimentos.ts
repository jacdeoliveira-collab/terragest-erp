import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import { obterComprovante } from '../services/comprovanteStorageService';
import { removerDespesaAbastecimento, ressincronizarDespesaAbastecimento } from '../services/abastecimentoFinanceiroSync';
import type { AbastecimentoItem } from '../types/abastecimento.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const getStorageKey = (tId: string) => `terragest_abastecimentos_cache_${tId}`;

function getCached(tId: string): AbastecimentoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useAbastecimentos() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [data, setData] = useState<AbastecimentoItem[]>(() => getCached(activeTenant));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(getCached(activeTenant));
  }, [activeTenant]);

  const fetchAbastecimentos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const cached = getCached(currentTenant);
      if (cached.length > 0) setData(cached);

      let query = supabase
        .from('abastecimentos')
        .select(`*, equipment:maquina_id (code, name), comboio:comboio_id (code, name)`)
        .order('data', { ascending: false });

      query = aplicarFiltroTenant(query, currentTenant);
      if (obraSelecionada?.id) query = query.eq('obra_id', obraSelecionada.id);

      const { data: responseData, error: responseError } = await query;
      if (responseError) throw new Error(responseError.message);

      interface RawAbast extends AbastecimentoItem {
        equipment?: { code: string; name: string };
        comboio?: { code: string; name: string };
      }

      const formatados: AbastecimentoItem[] = ((responseData as RawAbast[]) || []).map((item) => {
        const matchCupom = item.numero_requisicao_nf?.match(/\[REF:(CUP_[A-Z0-9]+)/);
        const cupomRef = matchCupom ? matchCupom[1] : null;
        let fotoArmazenada: string | undefined = undefined;
        if (cupomRef && typeof window !== 'undefined') {
          try {
            fotoArmazenada = localStorage.getItem(`terragest_cupom_foto_${cupomRef}`) || undefined;
          } catch {}
        }
        return {
          ...item,
          maquina_codigo: item.equipment?.code || item.maquina_codigo,
          maquina_nome: item.equipment?.name || item.maquina_nome,
          comboio_codigo: item.comboio?.code || item.comboio_codigo,
          comboio_nome: item.comboio?.name || item.comboio_nome,
          foto_comprovante: item.foto_comprovante || fotoArmazenada
        };
      });

      const listaValida = formatados.filter((item) => {
        const isSinteticoServico = item.numero_requisicao_nf && /\[REF:(?!CUP_)[^:]+:(MAQ|APOIO)\]/.test(item.numero_requisicao_nf);
        return !isSinteticoServico;
      });

      setData(listaValida);
      if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(currentTenant), JSON.stringify(listaValida));

      listaValida.forEach((item, idx) => {
        if (!item.foto_comprovante) {
          const matchCupom = item.numero_requisicao_nf?.match(/\[REF:(CUP_[A-Z0-9]+)/);
          if (matchCupom?.[1]) {
            obterComprovante(matchCupom[1]).then((foto) => {
              if (foto) setData((prev) => prev.map((p, i) => i === idx ? { ...p, foto_comprovante: foto } : p));
            });
          }
        }
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar abastecimentos');
      setData(getCached(tenantAtivoId || DEFAULT_LEGACY_TENANT));
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  const atualizarAbastecimento = async (id: string, updates: Partial<AbastecimentoItem>) => {
    try {
      const payload: Record<string, unknown> = { ...updates };
      ['equipment', 'comboio', 'maquina_codigo', 'maquina_nome', 'comboio_codigo', 'comboio_nome'].forEach((k) => delete payload[k]);
      const { error: err } = await supabase.from('abastecimentos').update(payload).eq('id', id);
      if (err) throw err;
      await ressincronizarDespesaAbastecimento(id);
      setData((prev) => {
        const novo = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
        if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(activeTenant), JSON.stringify(novo));
        return novo;
      });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao atualizar abastecimento' };
    }
  };

  const excluirAbastecimento = async (id: string) => {
    try {
      const { error: err } = await supabase.from('abastecimentos').delete().eq('id', id);
      if (err) throw err;
      await removerDespesaAbastecimento(id);
      setData((prev) => {
        const novo = prev.filter((item) => item.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem(getStorageKey(activeTenant), JSON.stringify(novo));
        return novo;
      });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao excluir abastecimento' };
    }
  };

  useEffect(() => { fetchAbastecimentos(); }, [fetchAbastecimentos]);

  return { data, isLoading, error, refetch: fetchAbastecimentos, atualizarAbastecimento, excluirAbastecimento };
}
