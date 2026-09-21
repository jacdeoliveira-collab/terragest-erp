import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useObraContext } from '../contexts/ObraContext';
import type { DashboardMetrics } from '../types/dashboard.types';

export function useDashboardMetrics() {
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<DashboardMetrics>({
    totalHoras: 0,
    totalMaquinas: 0,
    maquinasAtivas: 0,
    operadoresAtivos: 0,
    manutencoesAtrasadas: 0,
    combustivelTotalLitros: 0,
    custoEstimadoTotal: 0,
    custoCombustivel: 0,
    litrosConsumidos: 0,
    custoCombustivelFormatado: 'R$ 0,00',
    dadosGraficoHoras: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarMetricas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      const inicioMes = new Date();
      inicioMes.setDate(1);
      const dataInicioMes = inicioMes.toISOString().slice(0, 10);

      let equipQuery = supabase.from('equipment').select('id, status, current_hourmeter');
      let funcQuery = supabase.from('rh_funcionarios').select('id, status').eq('status', 'ATIVO');
      let bdeQuery = supabase.from('daily_bulletins').select('date, initial_hourmeter, final_hourmeter, total_hours');
      let abastecimentoQuery = supabase.from('abastecimentos').select('quantidade_litros, valor_total, data').gte('data', dataInicioMes);
      let manutencaoQuery = supabase.from('planos_manutencao').select('ultimo_horimetro_realizado, ultimo_horimetro, intervalo_horas, maquina_id');

      if (tenantId) {
        equipQuery = equipQuery.eq('tenant_id', tenantId);
        funcQuery = funcQuery.eq('tenant_id', tenantId);
        bdeQuery = bdeQuery.eq('tenant_id', tenantId);
        abastecimentoQuery = abastecimentoQuery.eq('tenant_id', tenantId);
        manutencaoQuery = manutencaoQuery.eq('tenant_id', tenantId);
      }

      if (obraSelecionada?.id) {
        bdeQuery = bdeQuery.eq('obra_id', obraSelecionada.id);
        abastecimentoQuery = abastecimentoQuery.eq('obra_id', obraSelecionada.id);
      }

      const [equipResponse, funcResponse, bdeResponse, abastecimentoResponse, manutencaoResponse] = await Promise.all([
        equipQuery,
        funcQuery,
        bdeQuery.order('date', { ascending: true }),
        abastecimentoQuery,
        manutencaoQuery
      ]);

      if (equipResponse.error) throw new Error(equipResponse.error.message);
      if (funcResponse.error) throw new Error(funcResponse.error.message);
      if (bdeResponse.error) throw new Error(bdeResponse.error.message);
      if (abastecimentoResponse.error) throw new Error(abastecimentoResponse.error.message);
      if (manutencaoResponse.error) throw new Error(manutencaoResponse.error.message);

      const maquinas = equipResponse.data || [];
      const operadoresAtivos = (funcResponse.data || []).length;
      const bulletins = bdeResponse.data || [];
      const abastecimentos = abastecimentoResponse.data || [];
      const planos = manutencaoResponse.data || [];

      const totalMaquinas = maquinas.length;
      const maquinasAtivas = maquinas.filter(
        (m) => m.status === 'IN_OPERATION' || m.status === 'AVAILABLE' || (m.status as string) === 'ATIVO'
      ).length;

      // Mapa de horímetro atual por máquina para cálculo de manutenções atrasadas
      const mapaHorimetroMaquina: Record<string, number> = {};
      maquinas.forEach((m) => {
        mapaHorimetroMaquina[m.id] = Number(m.current_hourmeter) || 0;
      });

      let manutencoesAtrasadas = 0;
      planos.forEach((p) => {
        const ult = Number(p.ultimo_horimetro_realizado ?? p.ultimo_horimetro ?? 0);
        const inter = Number(p.intervalo_horas ?? 250);
        const prox = ult + inter;
        const horimetroAtual = mapaHorimetroMaquina[p.maquina_id] || 0;
        if (horimetroAtual >= prox && prox > 0) {
          manutencoesAtrasadas += 1;
        }
      });

      let totalHoras = 0;
      const agrupamentoPorDia: Record<string, number> = {};

      bulletins.forEach((b) => {
        const diffHoras = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
        const horasEfetivas = Math.max(0, isNaN(diffHoras) ? Number(b.total_hours) || 0 : diffHoras);
        totalHoras += horasEfetivas;

        if (b.date) {
          const partes = b.date.split('-');
          const dataFormatada = partes.length === 3 ? `${partes[2]}/${partes[1]}` : b.date;
          agrupamentoPorDia[dataFormatada] = (agrupamentoPorDia[dataFormatada] || 0) + horasEfetivas;
        }
      });

      let custoCombustivel = 0;
      let litrosConsumidos = 0;

      abastecimentos.forEach((a) => {
        custoCombustivel += Number(a.valor_total) || 0;
        litrosConsumidos += Number(a.quantidade_litros) || 0;
      });

      const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      const dadosGraficoHoras = Object.keys(agrupamentoPorDia).map((chaveData) => ({
        data: chaveData,
        horas: Number(agrupamentoPorDia[chaveData].toFixed(1))
      }));

      setData({
        totalHoras: Number(totalHoras.toFixed(1)),
        totalMaquinas,
        maquinasAtivas,
        operadoresAtivos,
        manutencoesAtrasadas,
        combustivelTotalLitros: Number(litrosConsumidos.toFixed(1)),
        custoEstimadoTotal: Number(custoCombustivel.toFixed(2)),
        custoCombustivel: Number(custoCombustivel.toFixed(2)),
        litrosConsumidos: Number(litrosConsumidos.toFixed(1)),
        custoCombustivelFormatado: formatadorMoeda.format(custoCombustivel),
        dadosGraficoHoras
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar métricas';
      setError(msg);
      setData({
        totalHoras: 0,
        totalMaquinas: 0,
        maquinasAtivas: 0,
        operadoresAtivos: 0,
        manutencoesAtrasadas: 0,
        combustivelTotalLitros: 0,
        custoEstimadoTotal: 0,
        custoCombustivel: 0,
        litrosConsumidos: 0,
        custoCombustivelFormatado: 'R$ 0,00',
        dadosGraficoHoras: []
      });
    } finally {
      setIsLoading(false);
    }
  }, [obraSelecionada]);

  useEffect(() => {
    carregarMetricas();
  }, [carregarMetricas]);

  return {
    data,
    metrics: data,
    isLoading,
    loading: isLoading,
    error,
    refetch: carregarMetricas
  };
}
