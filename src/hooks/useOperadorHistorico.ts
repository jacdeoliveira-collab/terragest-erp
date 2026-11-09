import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { mapContaPagarToVale } from '../services/valeRhService';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { ValeColaboradorItem } from '../types/valeRh.types';

export interface OperadorHistoricoData {
  totalHoras: number;
  totalGanho: number;
  totalVales: number;
  saldoPagar: number;
  qtdServicos: number;
  servicos: ServicoHorimetro[];
  vales: ValeColaboradorItem[];
}

const INICIAL: OperadorHistoricoData = {
  totalHoras: 0,
  totalGanho: 0,
  totalVales: 0,
  saldoPagar: 0,
  qtdServicos: 0,
  servicos: [],
  vales: []
};

export function useOperadorHistorico(operadorNome?: string, operadorId?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<OperadorHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const nomeLimpo = (operadorNome || '').trim();
    if (!nomeLimpo && !operadorId) {
      setData(INICIAL);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let qSrv = supabase
        .from('servicos_horimetro')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (operadorId) {
        qSrv = qSrv.or(`operador_id.eq.${operadorId},operador_nome.ilike.%${nomeLimpo}%`);
      } else {
        qSrv = qSrv.ilike('operador_nome', `%${nomeLimpo}%`);
      }
      if (tenantAtivoId) qSrv = qSrv.eq('tenant_id', tenantAtivoId);

      let qVales = supabase
        .from('contas_pagar')
        .select('*, contas_bancarias(nome_conta)')
        .eq('categoria', 'FOLHA_RH')
        .order('data_pagamento', { ascending: false });

      if (operadorId && nomeLimpo) {
        qVales = qVales.or(`fornecedor.ilike.%${nomeLimpo}%,observacoes.ilike.%[COLAB_ID:${operadorId}]%`);
      } else if (operadorId) {
        qVales = qVales.ilike('observacoes', `%[COLAB_ID:${operadorId}]%`);
      } else {
        qVales = qVales.ilike('fornecedor', `%${nomeLimpo}%`);
      }
      if (tenantAtivoId) qVales = qVales.eq('tenant_id', tenantAtivoId);

      const [resSrv, resVales] = await Promise.all([qSrv, qVales]);
      if (resSrv.error) console.warn('Aviso servicos_horimetro operador:', resSrv.error.message);

      const servicos: ServicoHorimetro[] = resSrv.data || [];
      const rawVales = resVales.data || [];

      const vales: ValeColaboradorItem[] = rawVales
        .filter((cp: any) => {
          const obs = cp.observacoes || '';
          const desc = cp.descricao || '';
          return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale');
        })
        .map((cp: any) => mapContaPagarToVale(cp, operadorId, nomeLimpo));

      let totHoras = 0;
      let totGanho = 0;
      let totValesServicos = 0;

      servicos.forEach((s) => {
        const h = Number(s.horas_trabalhadas) || 0;
        const vHoraOp = Number(s.valor_hora_operador) || 0;
        const ganhoServico = vHoraOp > 0 ? Number((h * vHoraOp).toFixed(2)) : (Number(s.despesa_operador) || 0);
        const vale = Number(s.adiantamento_operador_valor) || 0;

        totHoras += h;
        totGanho += ganhoServico;
        totValesServicos += vale;
      });

      const totValesRh = vales.reduce((acc, v) => acc + v.valor, 0);
      const totValesConsolidado = Number((totValesServicos + totValesRh).toFixed(2));
      const saldo = Math.max(0, Number((totGanho - totValesConsolidado).toFixed(2)));

      setData({
        totalHoras: Number(totHoras.toFixed(1)),
        totalGanho: Number(totGanho.toFixed(2)),
        totalVales: totValesConsolidado,
        saldoPagar: saldo,
        qtdServicos: servicos.length,
        servicos,
        vales
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar histórico do operador');
    } finally {
      setIsLoading(false);
    }
  }, [operadorNome, operadorId, tenantAtivoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
