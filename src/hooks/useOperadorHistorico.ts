import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface OperadorHistoricoData {
  totalHoras: number;
  totalGanho: number;
  totalVales: number;
  saldoPagar: number;
  qtdServicos: number;
  servicos: ServicoHorimetro[];
}

const INICIAL: OperadorHistoricoData = {
  totalHoras: 0,
  totalGanho: 0,
  totalVales: 0,
  saldoPagar: 0,
  qtdServicos: 0,
  servicos: []
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

      let q = supabase
        .from('servicos_horimetro')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (operadorId) {
        q = q.or(`operador_id.eq.${operadorId},operador_nome.ilike.%${nomeLimpo}%`);
      } else {
        q = q.ilike('operador_nome', `%${nomeLimpo}%`);
      }

      if (tenantAtivoId) q = q.eq('tenant_id', tenantAtivoId);

      const res = await q;
      if (res.error) console.warn('Aviso servicos_horimetro operador:', res.error.message);

      const servicos: ServicoHorimetro[] = res.data || [];

      let totHoras = 0;
      let totGanho = 0;
      let totVales = 0;

      servicos.forEach((s) => {
        const h = Number(s.horas_trabalhadas) || 0;
        const vHoraOp = Number(s.valor_hora_operador) || 0;
        const ganhoServico = vHoraOp > 0 ? Number((h * vHoraOp).toFixed(2)) : (Number(s.despesa_operador) || 0);
        const vale = Number(s.adiantamento_operador_valor) || 0;

        totHoras += h;
        totGanho += ganhoServico;
        totVales += vale;
      });

      const saldo = Math.max(0, Number((totGanho - totVales).toFixed(2)));

      setData({
        totalHoras: Number(totHoras.toFixed(1)),
        totalGanho: Number(totGanho.toFixed(2)),
        totalVales: Number(totVales.toFixed(2)),
        saldoPagar: saldo,
        qtdServicos: servicos.length,
        servicos
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
