import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Obra } from '../types/obras.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const getStorageKey = (tId: string) => `terragest_obras_cache_${tId}`;

function getCachedObras(tId: string): Obra[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedObras(tId: string, list: Obra[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(tId), JSON.stringify(list));
  } catch {}
}

export function useObras() {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [obras, setObras] = useState<Obra[]>(() => getCachedObras(activeTenant));
  const [obraSelecionadaId, setObraSelecionadaId] = useState<string>(() => {
    const init = getCachedObras(activeTenant);
    return init[0]?.id || '';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedObras(activeTenant);
    setObras(cached);
    setObraSelecionadaId(cached[0]?.id || '');
  }, [activeTenant]);

  const carregarObras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const cached = getCachedObras(currentTenant);
      if (cached.length > 0) {
        setObras(cached);
        setObraSelecionadaId((prev) => prev || cached[0].id);
      }

      let query = supabase.from('obras').select('*').order('nome', { ascending: true });
      query = aplicarFiltroTenant(query, currentTenant);

      const { data, error: fetchError } = await query;

      if (!fetchError && Array.isArray(data)) {
        const listaObras = data as Obra[];
        setObras(listaObras);
        saveCachedObras(currentTenant, listaObras);
        setObraSelecionadaId((prev) => {
          if (prev && listaObras.some((o) => o.id === prev)) return prev;
          return listaObras[0]?.id || '';
        });
      } else if (fetchError) {
        setError(fetchError.message);
      }
    } catch {
      const currentCached = getCachedObras(tenantAtivoId || DEFAULT_LEGACY_TENANT);
      setObras(currentCached);
      setObraSelecionadaId((prev) => prev || currentCached[0]?.id || '');
    } finally {
      setLoading(false);
    }
  }, [tenantAtivoId]);

  useEffect(() => {
    carregarObras();
  }, [carregarObras]);

  const selecionarObra = (id: string) => {
    setObraSelecionadaId(id);
  };

  const obraAtual = obras.find((o) => o.id === obraSelecionadaId) || null;

  return {
    obras,
    obraSelecionadaId,
    obraAtual,
    loading,
    error,
    selecionarObra,
    recarregarObras: carregarObras
  };
}
