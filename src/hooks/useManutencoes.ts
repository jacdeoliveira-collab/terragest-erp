import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanoManutencaoItem } from '../types/manutencao.types';

export function useManutencoes() {
  const [data, setData] = useState<PlanoManutencaoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('planos_manutencao')
        .select(`
          *,
          equipment:maquina_id (code, name, current_hourmeter)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        throw new Error(responseError.message);
      }

      interface SupabasePlanoRaw extends PlanoManutencaoItem {
        equipment?: { code: string; name: string; current_hourmeter: number };
        servico?: string;
        ultimo_horimetro?: number;
      }

      const formatados: PlanoManutencaoItem[] = ((responseData as SupabasePlanoRaw[]) || []).map((item) => {
        const ultHorimetro = Number(item.ultimo_horimetro_realizado ?? item.ultimo_horimetro ?? 0);
        const intervHoras = Number(item.intervalo_horas ?? 250);
        const proxAlvo = ultHorimetro + intervHoras;
        const horimetroAtual = Number(item.equipment?.current_hourmeter) || 0;

        let statusCalc: 'EM_DIA' | 'PROXIMO_VENCIMENTO' | 'ATRASADO' = 'EM_DIA';
        if (horimetroAtual >= proxAlvo) {
          statusCalc = 'ATRASADO';
        } else if (proxAlvo - horimetroAtual <= 30) {
          statusCalc = 'PROXIMO_VENCIMENTO';
        }

        return {
          ...item,
          tipo_servico_nome: item.tipo_servico_nome || item.servico || 'Revisão Preventiva',
          ultimo_horimetro_realizado: ultHorimetro,
          intervalo_horas: intervHoras,
          maquina_codigo: item.equipment?.code,
          maquina_nome: item.equipment?.name,
          horimetro_atual_maquina: horimetroAtual,
          proximo_horimetro_alvo: proxAlvo,
          status: statusCalc
        };
      });

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar planos de manutenção';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanos();
  }, [fetchPlanos]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPlanos
  };
}
