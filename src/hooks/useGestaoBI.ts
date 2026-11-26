import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { aplicarFiltroTenant } from '../utils/tenantFilter';
import { calcularGestaoBI, type GestaoBIRawData } from '../utils/gestaoBICalculator';
import type { GestaoBIFiltros } from '../types/gestaoBI.types';

const EMPTY_RAW: GestaoBIRawData = {
  servicos: [], abastecimentos: [], contasPagar: [],
  equipments: [], manutencoes: [], agenda: [], obras: []
};

export const DEFAULT_GESTAO_FILTROS: GestaoBIFiltros = {
  periodo: 'MES_ATUAL',
  dataInicio: `${new Date().toISOString().slice(0, 7)}-01`,
  dataFim: new Date().toISOString().slice(0, 10),
  maquinaId: '',
  clienteNome: '',
  operadorNome: '',
  centroCustoId: ''
};

export function useGestaoBI() {
  const { tenantAtivoId } = useTenantContext();
  const [raw, setRaw] = useState<GestaoBIRawData>(EMPTY_RAW);
  const [filtros, setFiltros] = useState<GestaoBIFiltros>(DEFAULT_GESTAO_FILTROS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!tenantAtivoId) {
      setRaw(EMPTY_RAW);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const t = tenantAtivoId;

      const [resSrv, resAbast, resCp, resEq, resManut, resAg, resObras] = await Promise.all([
        aplicarFiltroTenant(supabase.from('servicos_horimetro').select('*'), t),
        aplicarFiltroTenant(supabase.from('abastecimentos').select('*'), t),
        aplicarFiltroTenant(supabase.from('contas_pagar').select('*'), t),
        aplicarFiltroTenant(supabase.from('equipment').select('*'), t),
        aplicarFiltroTenant(supabase.from('planos_manutencao').select('*'), t),
        aplicarFiltroTenant(supabase.from('agenda_operacional').select('*'), t),
        aplicarFiltroTenant(supabase.from('obras').select('*'), t)
      ]);

      setRaw({
        servicos: resSrv.data || [],
        abastecimentos: resAbast.data || [],
        contasPagar: resCp.data || [],
        equipments: resEq.data || [],
        manutencoes: resManut.data || [],
        agenda: resAg.data || [],
        obras: resObras.data || []
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar inteligência de gestão');
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const resultado = useMemo(() => calcularGestaoBI(raw, filtros), [raw, filtros]);

  const atualizarFiltro = <K extends keyof GestaoBIFiltros>(key: K, value: GestaoBIFiltros[K]) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const limparFiltros = () => setFiltros(DEFAULT_GESTAO_FILTROS);

  return { resultado, filtros, atualizarFiltro, limparFiltros, isLoading, error, refetch: fetchAll };
}
