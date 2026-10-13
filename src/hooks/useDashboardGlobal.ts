import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';
import { consolidarReceitasDashboard } from '../services/dashboardReceitasHelper';

export interface DashboardGlobalMetrics {
  obrasEmAndamento: number;
  frotasAtivas: number;
  totalEquipamentos: number;
  aReceberNoMes: number;
  recebidoNoMes: number;
  totalReceitasMes: number;
  aPagarNoMes: number;
  pagoNoMes: number;
  totalDespesasMes: number;
  saldoProjetado: number;
  mesAtual: string;
}

const INITIAL_METRICS: DashboardGlobalMetrics = {
  obrasEmAndamento: 0, frotasAtivas: 0, totalEquipamentos: 0,
  aReceberNoMes: 0, recebidoNoMes: 0, totalReceitasMes: 0,
  aPagarNoMes: 0, pagoNoMes: 0, totalDespesasMes: 0, saldoProjetado: 0,
  mesAtual: new Date().toISOString().slice(0, 7)
};

export function useDashboardGlobal() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [metrics, setMetrics] = useState<DashboardGlobalMetrics>(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const mesAtual = new Date().toISOString().slice(0, 7);

      let qObras = supabase.from('obras').select('id, status');
      let qEquip = supabase.from('equipment').select('id, status');
      let qPagar = supabase.from('contas_pagar').select('valor, status, data_vencimento, obra_id');
      let qMed = supabase.from('medicoes').select('*');
      let qServ = supabase.from('servicos_horimetro').select('*');

      qObras = aplicarFiltroTenant(qObras, currentTenant);
      qEquip = aplicarFiltroTenant(qEquip, currentTenant);
      qPagar = aplicarFiltroTenant(qPagar, currentTenant);
      qMed = aplicarFiltroTenant(qMed, currentTenant);
      qServ = aplicarFiltroTenant(qServ, currentTenant);

      if (obraSelecionada?.id) {
        qObras = qObras.eq('id', obraSelecionada.id);
        qPagar = qPagar.eq('obra_id', obraSelecionada.id);
        qMed = qMed.eq('obra_id', obraSelecionada.id);
        qServ = qServ.eq('obra_id', obraSelecionada.id);
      }

      const [resObras, resEquip, resPagar, resMed, resServ] = await Promise.all([
        qObras, qEquip, qPagar, qMed, qServ
      ]);

      if (resObras.error) throw new Error(resObras.error.message);
      if (resEquip.error) throw new Error(resEquip.error.message);
      if (resPagar.error) throw new Error(resPagar.error.message);

      const obrasEmAndamento = (resObras.data || []).filter(
        (o) => o.status === 'EM_ANDAMENTO' || o.status === 'ATIVA'
      ).length;

      const frotasAtivas = (resEquip.data || []).filter((e) => e.status !== 'INACTIVE').length;
      const totalEquipamentos = (resEquip.data || []).length;

      let aPagarAberto = 0;
      let aPagarPago = 0;
      (resPagar.data || []).forEach((cp) => {
        const val = Number(cp.valor) || 0;
        if (cp.data_vencimento?.startsWith(mesAtual) || cp.status === 'PENDENTE') {
          if (cp.status === 'PENDENTE') aPagarAberto += val;
          else if (cp.status === 'PAGO') aPagarPago += val;
        }
      });

      let servicosLista = resServ.data || [];
      try {
        const cached = localStorage.getItem(`terragest_servicos_horimetro_${currentTenant}`);
        if (cached) {
          const locais = JSON.parse(cached);
          if (Array.isArray(locais) && locais.length > 0) {
            const idsRemotos = new Set(servicosLista.map((s: any) => s.id));
            let novosLocais = locais.filter((l: any) => !idsRemotos.has(l.id));
            if (obraSelecionada?.id) {
              novosLocais = novosLocais.filter((l: any) => l.obra_id === obraSelecionada.id);
            }
            servicosLista = [...servicosLista, ...novosLocais];
          }
        }
      } catch {
        // Ignora erro de storage local
      }

      const { aReceberAberto, aReceberPago } = consolidarReceitasDashboard(
        servicosLista,
        resMed.data || [],
        mesAtual
      );

      const totalReceitas = aReceberAberto + aReceberPago;
      const totalDespesas = aPagarAberto + aPagarPago;

      setMetrics({
        obrasEmAndamento,
        frotasAtivas: frotasAtivas > 0 ? frotasAtivas : totalEquipamentos,
        totalEquipamentos,
        aReceberNoMes: aReceberAberto,
        recebidoNoMes: aReceberPago,
        totalReceitasMes: totalReceitas,
        aPagarNoMes: aPagarAberto,
        pagoNoMes: aPagarPago,
        totalDespesasMes: totalDespesas,
        saldoProjetado: totalReceitas - totalDespesas,
        mesAtual
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao consolidar dashboard global';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  useEffect(() => {
    fetchGlobal();
  }, [fetchGlobal]);

  return { metrics, isLoading, error, refetch: fetchGlobal };
}

