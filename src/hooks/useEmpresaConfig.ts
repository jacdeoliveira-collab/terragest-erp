import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { TenantMaster, EmpresaConfigPayload } from '../types/tenant.types';

export type { EmpresaConfigPayload };

export function useEmpresaConfig() {
  const { tenantAtivoId } = useTenantContext();
  const [empresa, setEmpresa] = useState<TenantMaster | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const fetchEmpresa = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Usuário não autenticado.');

      const tenantId =
        tenantAtivoId ||
        (userData.user.user_metadata?.tenant_id as string | undefined) ||
        (userData.user.app_metadata?.tenant_id as string | undefined);

      let query = supabase.from('tenants').select('*');
      if (tenantId) {
        query = query.eq('id', tenantId);
      } else {
        query = query.or(`admin_email.eq.${userData.user.email},contato_email.eq.${userData.user.email}`);
      }

      const { data, error: fetchError } = await query.maybeSingle();
      if (fetchError) throw new Error(fetchError.message);

      if (data) {
        setEmpresa(data as TenantMaster);
        if (typeof window !== 'undefined') localStorage.setItem('terragest_empresa_ativa_dados', JSON.stringify(data));
      } else {
        const { data: fallbackData } = await supabase.from('tenants').select('*').limit(1).maybeSingle();
        setEmpresa(fallbackData as TenantMaster | null);
        if (typeof window !== 'undefined' && fallbackData) localStorage.setItem('terragest_empresa_ativa_dados', JSON.stringify(fallbackData));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  const salvarConfiguracoes = async (payload: EmpresaConfigPayload) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const { data: userData } = await supabase.auth.getUser();
      const targetId = empresa?.id || tenantAtivoId || userData?.user?.id;

      const updateData = {
        nome: payload.razao_social.trim() || empresa?.nome || 'Minha Construtora',
        razao_social: payload.razao_social.trim(),
        cnpj: payload.cnpj.trim(),
        inscricao_estadual: payload.inscricao_estadual?.trim() || null,
        inscricao_municipal: payload.inscricao_municipal?.trim() || null,
        cnae: payload.cnae?.trim() || null,
        contato_telefone: payload.contato_telefone.trim(),
        contato_email: payload.contato_email.trim() || userData?.user?.email || '',
        admin_email: userData?.user?.email || '',
        endereco: payload.endereco.trim(),
        responsavel_tecnico: payload.responsavel_tecnico?.trim() || null,
        registro_crea: payload.registro_crea?.trim() || null,
        logo_url: payload.logo_url !== undefined ? payload.logo_url : (empresa?.logo_url || null),
        assinatura_digital_url: payload.assinatura_digital_url !== undefined ? payload.assinatura_digital_url : (empresa?.assinatura_digital_url || null),
        status_conta: empresa?.status_conta || 'ativo',
        plano: empresa?.plano || 'ENTERPRISE',
        updated_at: new Date().toISOString()
      };

      let { data: savedData, error: upsertErr } = await supabase
        .from('tenants')
        .upsert([{ id: targetId, ...updateData }], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (upsertErr && upsertErr.message.includes('assinatura_digital_url')) {
        const fallbackData = { ...updateData };
        delete (fallbackData as any).assinatura_digital_url;
        const retry = await supabase.from('tenants').upsert([{ id: targetId, ...fallbackData }], { onConflict: 'id' }).select().maybeSingle();
        savedData = retry.data;
        upsertErr = retry.error;
      }

      if (upsertErr) throw new Error(upsertErr.message);
      if (savedData) setEmpresa({ ...(savedData as TenantMaster), assinatura_digital_url: updateData.assinatura_digital_url || undefined });

      setSuccess(true);
      if (typeof window !== 'undefined' && targetId) {
        localStorage.setItem('terragest_tenant_ativo_id', targetId);
        localStorage.setItem('terragest_empresa_ativa_dados', JSON.stringify({ id: targetId, ...updateData }));
        window.dispatchEvent(new CustomEvent('terragest:tenant_changed', { detail: { tenantId: targetId } }));
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchEmpresa();
  }, [fetchEmpresa]);

  return {
    empresa,
    isLoading,
    isSaving,
    error,
    success,
    salvarConfiguracoes,
    refetch: fetchEmpresa,
    limparStatus: () => {
      setError(null);
      setSuccess(false);
    }
  };
}
