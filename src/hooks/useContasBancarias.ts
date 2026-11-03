import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { obterConfigAsaas, salvarConfigAsaasBanco } from '../services/asaasApiClient';
import { isContaCaixaFisico, garantirCaixaFisico } from '../services/caixaFisicoService';
import type { ContaBancaria, CreateContaBancariaDTO, UpdateContaBancariaDTO } from '../types/contaBancaria.types';

export { isContaCaixaFisico };

export function useContasBancarias() {
  const { tenantAtivoId } = useTenantContext();
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let q = supabase.from('contas_bancarias').select('*').order('is_padrao', { ascending: false }).order('nome_conta');
      if (tenantId) q = q.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);

      const { data, error: err } = await q;
      if (err) throw new Error(err.message);
      let lista = (data as ContaBancaria[]) || [];

      if (lista.length === 0) {
        const cfg = await obterConfigAsaas(tenantId);
        if (cfg && (cfg.apiKey || cfg.chavePix || cfg.nomeBancoCustom)) {
          await salvarConfigAsaasBanco(cfg, tenantId);
          let qRetry = supabase.from('contas_bancarias').select('*').order('is_padrao', { ascending: false }).order('nome_conta');
          if (tenantId) qRetry = qRetry.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
          const { data: dataRetry } = await qRetry;
          lista = (dataRetry as ContaBancaria[]) || [];
        }
      }

      // Garante que sempre exista uma conta de Caixa Físico (Dinheiro em Mãos) para pagamentos e recebimentos em espécie
      lista = await garantirCaixaFisico(lista, tenantId);

      setContas(lista);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar contas bancárias');
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  const criarConta = async (dto: CreateContaBancariaDTO): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      if (dto.is_padrao) {
        let qPadrao = supabase.from('contas_bancarias').update({ is_padrao: false });
        if (tenantId) qPadrao = qPadrao.eq('tenant_id', tenantId);
        await qPadrao;
      }

      const { error: insErr } = await supabase.from('contas_bancarias').insert([{
        ...dto,
        tenant_id: tenantId || null,
        saldo_inicial: Number(dto.saldo_inicial) || 0
      }]);
      if (insErr) throw new Error(insErr.message);

      await fetchContas();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao criar conta' };
    }
  };

  const atualizarConta = async (id: string, dto: UpdateContaBancariaDTO): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      if (dto.is_padrao) {
        let qPadrao = supabase.from('contas_bancarias').update({ is_padrao: false });
        if (tenantId) qPadrao = qPadrao.eq('tenant_id', tenantId);
        await qPadrao;
      }

      const { error: updErr } = await supabase.from('contas_bancarias').update({
        ...dto,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (updErr) throw new Error(updErr.message);

      await fetchContas();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao atualizar conta' };
    }
  };

  const excluirConta = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: delErr } = await supabase.from('contas_bancarias').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);
      await fetchContas();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao excluir conta' };
    }
  };

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  const contaPadrao = useMemo(() => {
    return contas.find((c) => c.is_padrao) || contas.find((c) => !isContaCaixaFisico(c)) || contas[0] || null;
  }, [contas]);

  const contaCaixa = useMemo(() => {
    return contas.find((c) => isContaCaixaFisico(c)) || null;
  }, [contas]);

  return { contas, contaPadrao, contaCaixa, isLoading, error, refetch: fetchContas, criarConta, atualizarConta, excluirConta };
}

