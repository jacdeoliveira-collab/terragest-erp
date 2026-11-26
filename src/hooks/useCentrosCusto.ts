import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { CentroCusto, CreateCentroCustoDTO, CentroCustoDreResumo } from '../types/centroCusto.types';
import { aplicarFiltroTenant } from '../utils/tenantFilter';

export function useCentrosCusto() {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId;
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCentrosCusto = useCallback(async () => {
    if (!activeTenant) {
      setCentrosCusto([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('obras').select('*').order('nome', { ascending: true });
      query = aplicarFiltroTenant(query, activeTenant);
      const { data, error: fetchError } = await query;
      if (fetchError) throw new Error(fetchError.message);
      setCentrosCusto((data || []) as CentroCusto[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar centros de custo');
    } finally {
      setLoading(false);
    }
  }, [activeTenant]);

  useEffect(() => {
    carregarCentrosCusto();
  }, [carregarCentrosCusto]);

  const salvarCentroCusto = async (dto: CreateCentroCustoDTO, id?: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        nome: dto.nome.trim(),
        localizacao: dto.descricao?.trim() || null,
        endereco_completo: dto.descricao?.trim() || null,
        cliente: dto.cliente?.trim() || null,
        cliente_nome: dto.cliente?.trim() || null,
        data_registro: dto.data_registro,
        data_inicio: dto.data_registro,
        ano_safra: dto.ano_safra.trim(),
        status: dto.status || 'EM_ANDAMENTO',
        tenant_id: activeTenant
      };
      const res = id
        ? await supabase.from('obras').update(payload).eq('id', id)
        : await supabase.from('obras').insert([payload]);
      if (res.error) throw new Error(res.error.message);
      await carregarCentrosCusto();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar centro de custo';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const excluirCentroCusto = async (id: string) => {
    const { error: delError } = await supabase.from('obras').delete().eq('id', id);
    if (delError) return { success: false, error: delError.message };
    await carregarCentrosCusto();
    return { success: true };
  };

  return {
    centrosCusto,
    obras: centrosCusto,
    loading,
    isSubmitting,
    error,
    recarregarCentrosCusto: carregarCentrosCusto,
    recarregarObras: carregarCentrosCusto,
    salvarCentroCusto,
    excluirCentroCusto
  };
}

export async function calcularDreCentroCusto(centroId: string, tenantId?: string): Promise<CentroCustoDreResumo> {
  const qM = aplicarFiltroTenant(supabase.from('planos_manutencao').select('valor_pecas, valor_mao_obra').eq('obra_id', centroId), tenantId);
  const qA = aplicarFiltroTenant(supabase.from('abastecimentos').select('valor_total, quantidade_litros, valor_unitario').eq('obra_id', centroId), tenantId);
  const qC = aplicarFiltroTenant(supabase.from('contas_pagar').select('valor, categoria, observacoes').eq('obra_id', centroId).neq('categoria', 'COMBUSTIVEL'), tenantId);
  const qS = aplicarFiltroTenant(supabase.from('servicos_horimetro').select('faturamento_bruto').eq('obra_id', centroId), tenantId);
  const qMed = aplicarFiltroTenant(supabase.from('medicoes').select('valor_total').eq('obra_id', centroId), tenantId);

  const [rM, rA, rC, rS, rMed] = await Promise.all([qM, qA, qC, qS, qMed]);

  let totalPecas = 0, totalMaoObra = 0;
  ((rM.data || []) as Array<{ valor_pecas?: number; valor_mao_obra?: number }>).forEach((m) => {
    totalPecas += Number(m.valor_pecas) || 0;
    totalMaoObra += Number(m.valor_mao_obra) || 0;
  });

  let totalCombustivel = 0, totalLitrosCombustivel = 0;
  ((rA.data || []) as Array<{ valor_total?: number; quantidade_litros?: number; valor_unitario?: number }>).forEach((a) => {
    const vt = Number(a.valor_total) || (Number(a.quantidade_litros) || 0) * (Number(a.valor_unitario) || 0);
    totalCombustivel += vt;
    totalLitrosCombustivel += Number(a.quantidade_litros) || 0;
  });

  let totalOutrasDespesas = 0, totalFolha = 0;
  ((rC.data || []) as Array<{ valor?: number; categoria?: string; observacoes?: string }>).forEach((c) => {
    if ((c.observacoes || '').includes('[REF:MANUT_')) return;
    const v = Number(c.valor) || 0;
    if (c.categoria === 'FOLHA_RH') totalFolha += v; else totalOutrasDespesas += v;
  });

  const recServ = ((rS.data || []) as Array<{ faturamento_bruto?: number }>).reduce((acc: number, s) => acc + (Number(s.faturamento_bruto) || 0), 0);
  const recMed = ((rMed.data || []) as Array<{ valor_total?: number }>).reduce((acc: number, m) => acc + (Number(m.valor_total) || 0), 0);
  const receitaTotal = Math.max(recServ, recMed);
  const totalManutencao = totalPecas + totalMaoObra;
  const custoTotalGeral = totalManutencao + totalCombustivel + totalOutrasDespesas + totalFolha;
  const lucroOperacional = receitaTotal - custoTotalGeral;
  const margemLucro = receitaTotal > 0 ? (lucroOperacional / receitaTotal) * 100 : 0;

  return {
    custoTotalGeral, receitaTotal, lucroOperacional, margemLucro,
    totalManutencao, totalPecas, totalMaoObra, totalCombustivel,
    totalLitrosCombustivel, totalOutrasDespesas, totalFolha,
    qtdAbastecimentos: (rA.data || []).length
  };
}
