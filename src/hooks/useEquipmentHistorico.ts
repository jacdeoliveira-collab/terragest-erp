import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Equipment } from '../types/equipment.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { AbastecimentoItem } from '../types/abastecimento.types';
import { aplicarFiltroTenant } from '../utils/tenantFilter';
import {
  consolidarHistoricoEquipamento,
  type EquipmentHistoricoData
} from '../services/equipmentHistoricoConsolidador';

export type { EquipmentHistoricoData };

const INICIAL: EquipmentHistoricoData = {
  totalHorasTrabalhadas: 0,
  totalHorasDeslocamento: 0,
  totalHorasRodadas: 0,
  eficienciaFaturamento: 100,
  faturamentoTotal: 0,
  dieselTotalLitros: 0,
  dieselTotalValor: 0,
  lucroLiquidoTotal: 0,
  margemLucroGeral: 0,
  servicos: [],
  servicosDeslocamento: [],
  abastecimentos: [],
  operadores: []
};

interface RawAbastItem extends AbastecimentoItem {
  equipment?: { id?: string; code?: string; name?: string };
}

export function useEquipmentHistorico(equipment?: Equipment | null) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<EquipmentHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!equipment) {
      setData(INICIAL);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      let qServ = supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: false });
      if (equipment.id) {
        qServ = qServ.or(`maquina_id.eq.${equipment.id},maquina_nome.ilike.%${equipment.name}%`);
      }
      qServ = aplicarFiltroTenant(qServ, tenantAtivoId);

      let qAbast = supabase
        .from('abastecimentos')
        .select(`*, equipment:maquina_id (id, code, name), comboio:comboio_id (code, name)`)
        .order('data', { ascending: false });
      qAbast = aplicarFiltroTenant(qAbast, tenantAtivoId);

      const [resServ, resAbast] = await Promise.all([qServ, qAbast]);
      const servicos: ServicoHorimetro[] = resServ.data || [];
      let todosAbast: RawAbastItem[] = (resAbast.data as RawAbastItem[]) || [];

      if (todosAbast.length === 0 && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`terragest_abastecimentos_cache_${tenantAtivoId}`);
          if (cached) todosAbast = JSON.parse(cached);
        } catch {}
      }

      const abastecimentos: AbastecimentoItem[] = todosAbast
        .filter((a) => {
          if (a.numero_requisicao_nf && /\[REF:(?!CUP_)[^:]+:(MAQ|APOIO)\]/.test(a.numero_requisicao_nf)) return false;
          const matchId = equipment.id && a.maquina_id === equipment.id;
          const matchCode = (a.equipment?.code && a.equipment.code === equipment.code) ||
                            (a.maquina_codigo && a.maquina_codigo === equipment.code);
          const matchNome = (a.equipment?.name && a.equipment.name === equipment.name) ||
                            (a.maquina_nome && a.maquina_nome === equipment.name);
          return matchId || matchCode || matchNome;
        })
        .map((a) => ({
          ...a,
          maquina_codigo: a.equipment?.code || a.maquina_codigo || equipment.code,
          maquina_nome: a.equipment?.name || a.maquina_nome || equipment.name
        }));

      setData(consolidarHistoricoEquipamento(servicos, abastecimentos));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  }, [equipment, tenantAtivoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
