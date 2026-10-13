import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { inviteUserToTenant } from '../services/tenantAuthService';
import type { TenantMaster, UpdateTenantDTO, CreateTenantDTO } from '../types/tenant.types';

export function useMasterTenants() {
  const [tenants, setTenants] = useState<TenantMaster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);
      setTenants((data as TenantMaster[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar empresas');
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const alternarStatusConta = async (id: string, novoStatus: 'ativo' | 'bloqueado') => {
    try {
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ status_conta: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status_conta: novoStatus } : t))
      );
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro' };
    }
  };

  const atualizarTenant = async (id: string, payload: UpdateTenantDTO) => {
    try {
      const valor = payload.valor_mensalidade ?? payload.plano_valor;
      const { data, error: updateError } = await supabase
        .from('tenants')
        .update({
          ...payload,
          plano_valor: valor,
          valor_mensalidade: valor,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? (data as TenantMaster) : t))
      );
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar' };
    }
  };

  const criarTenant = async (payload: CreateTenantDTO) => {
    try {
      const valor = Number(payload.valor_mensalidade ?? payload.plano_valor) || 0;
      const email = payload.admin_email?.trim() || payload.contato_email?.trim() || null;
      const diaVenc = typeof payload.data_vencimento_fatura === 'number' ? payload.data_vencimento_fatura : 10;

      const { data, error: insertError } = await supabase
        .from('tenants')
        .insert([{
          nome: payload.nome.trim(),
          cnpj: payload.cnpj?.trim() || null,
          slogan: payload.slogan?.trim() || null,
          logo_url: payload.logo_url?.trim() || null,
          plano: payload.plano || 'START',
          plano_valor: valor,
          valor_mensalidade: valor,
          admin_email: email,
          contato_email: email,
          limite_usuarios: Number(payload.limite_usuarios) || 5,
          data_vencimento_fatura: diaVenc,
          status_conta: payload.status_conta || 'ativo',
          assinatura_inicio: payload.assinatura_inicio || new Date().toISOString().slice(0, 10),
          assinatura_fim: payload.assinatura_fim || null,
          contato_telefone: payload.contato_telefone?.trim() || null
        }])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      const novoTenant = data as TenantMaster;
      setTenants((prev) => [...prev, novoTenant]);

      // Acionar convite automático para o e-mail do administrador
      if (email) {
        await inviteUserToTenant({
          email,
          role: 'admin',
          targetTenantId: novoTenant.id,
          nome: payload.nome
        });
      }

      return { success: true, data: novoTenant };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao cadastrar' };
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    isLoading,
    error,
    refetch: fetchTenants,
    alternarStatusConta,
    atualizarTenant,
    criarTenant
  };
}
