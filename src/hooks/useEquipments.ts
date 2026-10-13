import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Equipment } from '../types/equipment.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

interface UseEquipmentsOptions {
  onlyActives?: boolean;
}

const getStorageKey = (tId: string) => `terragest_local_equipments_${tId}`;

function getCached(tId: string): Equipment[] {
  try {
    const local = JSON.parse(localStorage.getItem(getStorageKey(tId)) || '[]');
    return Array.isArray(local) ? local : [];
  } catch {
    return [];
  }
}

export function useEquipments(options?: UseEquipmentsOptions) {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [data, setData] = useState<Equipment[]>(() => getCached(activeTenant));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(getCached(activeTenant));
  }, [activeTenant]);

  const fetchEquipments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const localList = getCached(currentTenant);
      if (localList.length > 0) setData(localList);

      let query = supabase
        .from('equipment')
        .select('*')
        .order('code', { ascending: true });

      query = aplicarFiltroTenant(query, currentTenant);

      if (options?.onlyActives) {
        query = query.or('status.eq.ATIVO,status.eq.AVAILABLE');
      }

      const { data: responseData, error: responseError } = await query;

      if (!responseError && Array.isArray(responseData)) {
        setData(responseData);
        try {
          localStorage.setItem(getStorageKey(currentTenant), JSON.stringify(responseData));
        } catch {}
      } else if (responseError && localList.length > 0) {
        setData(localList);
      }
    } catch (err: unknown) {
      console.warn('Falha ao sincronizar frota remota:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options?.onlyActives, tenantAtivoId]);

  const atualizarEquipment = async (id: string, payload: Partial<Equipment>) => {
    try {
      const { data: updated, error: err } = await supabase
        .from('equipment')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw new Error(err.message);
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      return { success: true, data: updated };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar máquina' };
    }
  };

  const excluirEquipment = async (id: string) => {
    try {
      const { error: err } = await supabase.from('equipment').delete().eq('id', id);
      if (err) throw new Error(err.message);
      setData((prev) => prev.filter((item) => item.id !== id));
      try {
        const local = JSON.parse(localStorage.getItem('terragest_local_equipments') || '[]');
        const filtered = local.filter((e: Equipment) => e.id !== id);
        localStorage.setItem('terragest_local_equipments', JSON.stringify(filtered));
      } catch {}
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir máquina' };
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchEquipments,
    atualizarEquipment,
    excluirEquipment
  };
}

