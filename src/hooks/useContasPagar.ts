import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { ContaPagarItem, CreateContaPagarDTO, FormaPagamentoDespesa } from '../types/contasPagar.types';
import { deduplicarContasPagar } from '../services/contasPagarDeduplicacaoHelper';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export function useContasPagar() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<ContaPagarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContasPagar = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;

      let q = supabase
        .from('contas_pagar')
        .select('*')
        .order('data_vencimento', { ascending: true });

      q = aplicarFiltroTenant(q, currentTenant);
      if (obraSelecionada?.id) q = q.eq('obra_id', obraSelecionada.id);

      const [contasRes, obrasRes] = await Promise.all([
        q,
        supabase.from('obras').select('id, nome')
      ]);

      if (contasRes.error) throw new Error(contasRes.error.message);

      const obrasMap = new Map((obrasRes.data || []).map((o) => [o.id, o.nome]));
      const { lista, idsParaExcluir } = deduplicarContasPagar(contasRes.data || [], obrasMap);

      setData(lista);
      if (idsParaExcluir.length > 0) {
        supabase.from('contas_pagar').delete().in('id', idsParaExcluir).then(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar contas a pagar';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, obraSelecionada?.id]);

  const criarContaPagar = async (dto: CreateContaPagarDTO): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const payload = {
        tenant_id: tenantId || null,
        obra_id: dto.obra_id || null,
        descricao: dto.descricao.trim(),
        fornecedor: dto.fornecedor.trim(),
        categoria: dto.categoria,
        valor: Number(dto.valor) || 0,
        data_vencimento: dto.data_vencimento,
        status: 'PENDENTE',
        observacoes: dto.observacoes?.trim() || null
      };

      const { error: insErr } = await supabase.from('contas_pagar').insert([payload]);
      if (insErr) throw new Error(insErr.message);

      await fetchContasPagar();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar conta a pagar';
      return { success: false, error: msg };
    }
  };

  const atualizarContaPagar = async (id: string, dto: Partial<CreateContaPagarDTO>): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (dto.descricao !== undefined) payload.descricao = dto.descricao.trim();
      if (dto.fornecedor !== undefined) payload.fornecedor = dto.fornecedor.trim();
      if (dto.categoria !== undefined) payload.categoria = dto.categoria;
      if (dto.valor !== undefined) payload.valor = Number(dto.valor) || 0;
      if (dto.data_vencimento !== undefined) payload.data_vencimento = dto.data_vencimento;
      if (dto.obra_id !== undefined) payload.obra_id = dto.obra_id || null;
      if (dto.observacoes !== undefined) payload.observacoes = dto.observacoes?.trim() || null;

      const { error: updErr } = await supabase.from('contas_pagar').update(payload).eq('id', id);
      if (updErr) throw new Error(updErr.message);

      await fetchContasPagar();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar despesa';
      return { success: false, error: msg };
    }
  };

  const darBaixa = async (
    id: string,
    data_pagamento: string,
    forma_pagamento: FormaPagamentoDespesa | string,
    conta_bancaria_id?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updErr } = await supabase
        .from('contas_pagar')
        .update({
          status: 'PAGO',
          data_pagamento,
          forma_pagamento,
          conta_bancaria_id: conta_bancaria_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updErr) throw new Error(updErr.message);

      await fetchContasPagar();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar pagamento';
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchContasPagar();
  }, [fetchContasPagar]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchContasPagar,
    criarContaPagar,
    atualizarContaPagar,
    darBaixa
  };
}
