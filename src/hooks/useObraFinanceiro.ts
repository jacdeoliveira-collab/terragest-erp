import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { buscarCustosExtrasObra, filtroTenant, type CustosExtrasObra } from '../services/obraCustosExtrasService';
import { buscarReceitasDaObra } from '../services/obraReceitasService';

export interface ObraFinanceiroResumo {
  custoTotalGeral: number;
  receitaTotal: number;
  receitaRecebida: number;
  receitaAReceber: number;
  lucroOperacional: number;
  margemLucro: number;
  totalManutencao: number;
  totalPecas: number;
  totalMaoObra: number;
  totalCombustivel: number;
  totalLitrosCombustivel: number;
  totalHorasOperadas: number;
  qtdManutencoes: number;
  qtdAbastecimentos: number;
  qtdBoletins: number;
  extras: CustosExtrasObra;
  custoPorM3: number | null;
}

const EXTRAS_INICIAL: CustosExtrasObra = {
  totalOutrasDespesas: 0, totalFolha: 0, totalMaoObraOperadores: 0,
  custoEstimadoMaquinas: 0, volumeProduzidoM3: 0, qtdViagens: 0
};

const RESUMO_INICIAL: ObraFinanceiroResumo = {
  custoTotalGeral: 0, receitaTotal: 0, receitaRecebida: 0, receitaAReceber: 0,
  lucroOperacional: 0, margemLucro: 0, totalManutencao: 0, totalPecas: 0,
  totalMaoObra: 0, totalCombustivel: 0, totalLitrosCombustivel: 0,
  totalHorasOperadas: 0, qtdManutencoes: 0, qtdAbastecimentos: 0, qtdBoletins: 0,
  extras: EXTRAS_INICIAL, custoPorM3: null
};

export function useObraFinanceiro(obraId?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [resumo, setResumo] = useState<ObraFinanceiroResumo>(RESUMO_INICIAL);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarFinanceiro = useCallback(async () => {
    if (!obraId) {
      setResumo(RESUMO_INICIAL);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let qManut = supabase.from('planos_manutencao').select('valor_pecas, valor_mao_obra').eq('obra_id', obraId);
      let qAbast = supabase.from('abastecimentos').select('valor_total, quantidade_litros, valor_unitario').eq('obra_id', obraId);
      let qBde = supabase.from('daily_bulletins').select('total_hours').eq('obra_id', obraId);

      const ft = filtroTenant(tenantId);
      if (ft) {
        qManut = qManut.or(ft);
        qAbast = qAbast.or(ft);
        qBde = qBde.or(ft);
      }

      const [resManut, resAbast, resBde, extras, recs] = await Promise.all([
        qManut,
        qAbast,
        qBde,
        buscarCustosExtrasObra(obraId, tenantId),
        buscarReceitasDaObra(obraId, tenantId)
      ]);
      if (resManut.error) throw new Error(resManut.error.message);

      let pecas = 0;
      let maoObra = 0;
      (resManut.data || []).forEach((m) => {
        pecas += Number(m.valor_pecas) || 0;
        maoObra += Number(m.valor_mao_obra) || 0;
      });
      const manutTotal = pecas + maoObra;

      let combValor = 0;
      let combLitros = 0;
      (resAbast.data || []).forEach((a) => {
        const vTotal = Number(a.valor_total) || 0;
        const vCalculado = (Number(a.quantidade_litros) || 0) * (Number(a.valor_unitario) || 0);
        combValor += vTotal > 0 ? vTotal : vCalculado;
        combLitros += Number(a.quantidade_litros) || 0;
      });

      let horas = 0;
      (resBde.data || []).forEach((b) => {
        horas += Number(b.total_hours) || 0;
      });

      const custoTotal = manutTotal + combValor + extras.totalOutrasDespesas + extras.totalFolha + extras.totalMaoObraOperadores;
      const recTotal = recs.receitaTotal;
      const lucro = recTotal - custoTotal;
      const margem = recTotal > 0 ? (lucro / recTotal) * 100 : 0;

      setResumo({
        custoTotalGeral: custoTotal,
        receitaTotal: recTotal,
        receitaRecebida: recs.receitaRecebida,
        receitaAReceber: recs.receitaAReceber,
        lucroOperacional: lucro,
        margemLucro: margem,
        extras,
        custoPorM3: extras.volumeProduzidoM3 > 0 ? custoTotal / extras.volumeProduzidoM3 : null,
        totalManutencao: manutTotal,
        totalPecas: pecas,
        totalMaoObra: maoObra,
        totalCombustivel: combValor,
        totalLitrosCombustivel: combLitros,
        totalHorasOperadas: horas,
        qtdManutencoes: resManut.data?.length || 0,
        qtdAbastecimentos: resAbast.data?.length || 0,
        qtdBoletins: resBde.data?.length || 0
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao consolidar financeiro da obra';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [obraId, tenantAtivoId]);

  useEffect(() => {
    carregarFinanceiro();
  }, [carregarFinanceiro]);

  return { resumo, loading, error, refetch: carregarFinanceiro };
}
