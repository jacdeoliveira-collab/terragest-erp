import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Cliente } from '../types/comercial.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { aplicarFiltroTenant } from '../utils/tenantFilter';

export interface ClienteHistoricoData {
  totalFaturado: number;
  totalAdiantamentos: number;
  totalSaldoAberto: number;
  totalHoras: number;
  totalLucro: number;
  qtdServicos: number;
  qtdQuitados: number;
  servicos: ServicoHorimetro[];
}

const INICIAL: ClienteHistoricoData = {
  totalFaturado: 0,
  totalAdiantamentos: 0,
  totalSaldoAberto: 0,
  totalHoras: 0,
  totalLucro: 0,
  qtdServicos: 0,
  qtdQuitados: 0,
  servicos: []
};

export function useClienteHistorico(cliente?: Cliente | null) {
  const { tenantAtivoId } = useTenantContext();
  const [data, setData] = useState<ClienteHistoricoData>(INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!cliente?.id) {
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

      if (cliente.id) {
        q = q.or(`cliente_id.eq.${cliente.id},cliente_nome.ilike.%${cliente.nome}%`);
      }
      q = aplicarFiltroTenant(q, tenantAtivoId);

      const res = await q;
      if (res.error) console.warn('Aviso servicos_horimetro cliente:', res.error.message);

      const servicos: ServicoHorimetro[] = res.data || [];

      const totalFaturado = servicos.reduce((acc, s) => acc + (Number(s.faturamento_bruto) || 0), 0);
      const totalAdiantamentos = servicos.reduce((acc, s) => {
        const hist = Array.isArray(s.adiantamentos_historico)
          ? s.adiantamentos_historico.reduce((sum, h) => sum + (Number(h.valor) || 0), 0)
          : 0;
        return acc + Math.max(Number(s.valor_adiantamento) || 0, hist);
      }, 0);

      const totalSaldoAberto = servicos.reduce((acc, s) => {
        const fat = Number(s.faturamento_bruto) || 0;
        const hist = Array.isArray(s.adiantamentos_historico)
          ? s.adiantamentos_historico.reduce((sum, h) => sum + (Number(h.valor) || 0), 0)
          : 0;
        const adiant = Math.max(Number(s.valor_adiantamento) || 0, hist);
        const isQuit = s.status_pagamento_cliente === 'QUITADO' || (fat > 0 && (fat - adiant) <= 0.05);
        return acc + (isQuit ? 0 : Math.max(0, fat - adiant));
      }, 0);

      const totalHoras = servicos.reduce((acc, s) => acc + (Number(s.horas_trabalhadas) || 0), 0);
      const totalLucro = servicos.reduce((acc, s) => acc + (Number(s.lucro_liquido) || 0), 0);
      const qtdQuitados = servicos.filter(s => {
        const fat = Number(s.faturamento_bruto) || 0;
        const hist = Array.isArray(s.adiantamentos_historico)
          ? s.adiantamentos_historico.reduce((sum, h) => sum + (Number(h.valor) || 0), 0)
          : 0;
        const adiant = Math.max(Number(s.valor_adiantamento) || 0, hist);
        return fat > 0 && (s.status_pagamento_cliente === 'QUITADO' || (fat - adiant) <= 0.05);
      }).length;

      setData({
        totalFaturado,
        totalAdiantamentos,
        totalSaldoAberto,
        totalHoras,
        totalLucro,
        qtdServicos: servicos.length,
        qtdQuitados,
        servicos
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar histórico do cliente';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [cliente, tenantAtivoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { data, isLoading, error, refetch: carregar };
}
