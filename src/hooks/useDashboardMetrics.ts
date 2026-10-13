import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useObraContext } from '../contexts/ObraContext';
import { useTenantContext } from '../contexts/TenantContext';
import type { DashboardMetrics } from '../types/dashboard.types';
import { consolidarHorasOperacionais } from '../services/dashboardHorasHelper';

const INITIAL_METRICS: DashboardMetrics = {
  totalHoras: 0, totalMaquinas: 0, maquinasAtivas: 0, operadoresAtivos: 0,
  manutencoesAtrasadas: 0, combustivelTotalLitros: 0, custoEstimadoTotal: 0,
  custoCombustivel: 0, litrosConsumidos: 0, custoCombustivelFormatado: 'R$ 0,00',
  faturamentoAprovado: 0, propostasPendentesCount: 0, valorPendente: 0, dadosGraficoHoras: []
};

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function useDashboardMetrics() {
  const { obraSelecionada } = useObraContext();
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarMetricas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const inicioMes = new Date();
      inicioMes.setDate(1);
      const dataInicioMes = inicioMes.toISOString().slice(0, 10);

      let qEq = supabase.from('equipment').select('*');
      let qFn = supabase.from('rh_funcionarios').select('*').eq('status', 'ATIVO');
      let qBd = supabase.from('daily_bulletins').select('*').order('date', { ascending: true });
      let qAb = supabase.from('abastecimentos').select('*').gte('data', dataInicioMes);
      let qPl = supabase.from('planos_manutencao').select('*');
      let qOrc = supabase.from('orcamentos').select('valor_total, status');
      let qServ = supabase.from('servicos_horimetro').select('*');

      if (tenantId) {
        qEq = qEq.eq('tenant_id', tenantId);
        qFn = qFn.eq('tenant_id', tenantId);
        qBd = qBd.eq('tenant_id', tenantId);
        qAb = qAb.eq('tenant_id', tenantId);
        qPl = qPl.eq('tenant_id', tenantId);
        qOrc = qOrc.eq('tenant_id', tenantId);
        qServ = qServ.eq('tenant_id', tenantId);
      }
      if (obraSelecionada?.id) {
        qBd = qBd.eq('obra_id', obraSelecionada.id);
        qAb = qAb.eq('obra_id', obraSelecionada.id);
        qPl = qPl.eq('obra_id', obraSelecionada.id);
        qServ = qServ.eq('obra_id', obraSelecionada.id);
      }
      const [resEq, resFn, resBd, resAb, resPl, resOrc, resServ] = await Promise.all([
        qEq, qFn, qBd, qAb, qPl, qOrc, qServ
      ]);

      const maquinas = resEq.data || [];
      const mapaEquips = new Map(maquinas.map((m) => [m.id, m]));
      const maquinasAtivas = maquinas.filter(
        (m) => m.status === 'IN_OPERATION' || m.status === 'AVAILABLE' || m.status === 'ATIVO'
      ).length;

      let atrasadas = 0;
      (resPl.data || []).forEach((p) => {
        const eq = mapaEquips.get(p.maquina_id || p.equipment_id);
        const horimetro = Number(eq?.current_hourmeter) || 0;
        const ult = Number(p.ultimo_horimetro_realizado ?? p.ultimo_horimetro ?? 0);
        const prox = ult + Number(p.intervalo_horas ?? 250);
        if (prox > 0 && horimetro >= prox) atrasadas += 1;
      });

      let servicosLista = resServ.data || [];
      try {
        const cached = localStorage.getItem(`terragest_servicos_horimetro_${tenantId}`);
        if (cached) {
          const locais = JSON.parse(cached);
          if (Array.isArray(locais) && locais.length > 0) {
            const idsRemotos = new Set(servicosLista.map((s: any) => s.id));
            let novosLocais = locais.filter((l: any) => !idsRemotos.has(l.id));
            if (obraSelecionada?.id) novosLocais = novosLocais.filter((l: any) => l.obra_id === obraSelecionada.id);
            servicosLista = [...servicosLista, ...novosLocais];
          }
        }
      } catch {}

      const { totalHoras, dadosGraficoHoras, custoExtraCombustivel, litrosExtraCombustivel } =
        consolidarHorasOperacionais(resBd.data || [], servicosLista);

      let custoComb = custoExtraCombustivel;
      let litrosComb = litrosExtraCombustivel;
      (resAb.data || []).forEach((a) => {
        custoComb += Number(a.valor_total) || 0;
        litrosComb += Number(a.quantidade_litros) || 0;
      });

      let faturamentoAprovado = 0;
      let propostasPendentesCount = 0;
      let valorPendente = 0;
      (resOrc.data || []).forEach((orc) => {
        const val = Number(orc.valor_total) || 0;
        if (orc.status === 'APROVADO' || orc.status === 'CONCLUIDO') {
          faturamentoAprovado += val;
        } else if (orc.status === 'PENDENTE') {
          propostasPendentesCount += 1;
          valorPendente += val;
        }
      });

      setData({
        totalHoras: Number(totalHoras.toFixed(1)),
        totalMaquinas: maquinas.length,
        maquinasAtivas,
        operadoresAtivos: (resFn.data || []).length,
        manutencoesAtrasadas: atrasadas,
        combustivelTotalLitros: Number(litrosComb.toFixed(1)),
        custoEstimadoTotal: Number(custoComb.toFixed(2)),
        custoCombustivel: Number(custoComb.toFixed(2)),
        litrosConsumidos: Number(litrosComb.toFixed(1)),
        custoCombustivelFormatado: formatadorMoeda.format(custoComb),
        faturamentoAprovado: Number(faturamentoAprovado.toFixed(2)),
        propostasPendentesCount,
        valorPendente: Number(valorPendente.toFixed(2)),
        dadosGraficoHoras
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar métricas');
      setData(INITIAL_METRICS);
    } finally {
      setIsLoading(false);
    }
  }, [obraSelecionada, tenantAtivoId]);

  useEffect(() => { carregarMetricas(); }, [carregarMetricas]);

  return { data, metrics: data, isLoading, loading: isLoading, error, refetch: carregarMetricas };
}
