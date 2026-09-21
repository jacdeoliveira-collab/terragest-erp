import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Equipment } from '../types/equipment.types';

interface UseEquipmentsOptions {
  onlyActives?: boolean;
}

export function useEquipments(options?: UseEquipmentsOptions) {
  const [data, setData] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('equipment')
        .select('*')
        .order('code', { ascending: true });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (options?.onlyActives) {
        // No banco pode ser 'AVAILABLE' ou 'ATIVO'
        query = query.or('status.eq.ATIVO,status.eq.AVAILABLE');
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      setData((responseData as Equipment[]) || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao buscar equipamentos da frota';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [options?.onlyActives]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchEquipments
  };
}
