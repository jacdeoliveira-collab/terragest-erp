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
        aplicarFiltroTenant(supabase.from('abastecimentos').select('id, data, created_at, maquina_id, obra_id, servico_id, litros, valor_total'), t),
        aplicarFiltroTenant(supabase.from('contas_pagar').select('id, valor, status, categoria, data_vencimento, created_at, obra_id, fornecedor, descricao, observacoes'), t),
        aplicarFiltroTenant(supabase.from('equipment').select('id, code, name, status, current_hourmeter'), t),
        aplicarFiltroTenant(supabase.from('planos_manutencao').select('id, maquina_id, equipment_id, obra_id, status, data_servico, data_ultima_execucao, created_at, horimetro_proxima_troca, valor_pecas, valor_mao_obra'), t),
        aplicarFiltroTenant(supabase.from('agenda_operacional').select('id, status, horas_previstas'), t),
        aplicarFiltroTenant(supabase.from('obras').select('id, nome, status'), t)
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
