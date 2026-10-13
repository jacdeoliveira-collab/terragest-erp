import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { TenantIntegration, IntegrationProvider, SaveIntegrationDTO } from '../types/integrations.types';

export function useIntegrations(tenantIdProp?: string) {
  const { tenantAtivoId } = useTenantContext();
  const targetTenantId = tenantIdProp || tenantAtivoId;

  const [integrations, setIntegrations] = useState<Record<string, TenantIntegration>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!targetTenantId) {
      setIntegrations({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('tenant_integrations')
        .select('*')
        .eq('tenant_id', targetTenantId);

      if (fetchErr) throw new Error(fetchErr.message);

      const mapped: Record<string, TenantIntegration> = {};
      (data || []).forEach((item: TenantIntegration) => {
        mapped[item.provider] = item;
      });

      setIntegrations(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar integrações';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetTenantId]);

  const desconectar = async (provider: IntegrationProvider): Promise<{ success: boolean; error?: string }> => {
    if (!targetTenantId) return { success: false, error: 'Empresa não selecionada' };

    try {
      const { error: delErr } = await supabase
        .from('tenant_integrations')
        .delete()
        .eq('tenant_id', targetTenantId)
        .eq('provider', provider);

      if (delErr) throw new Error(delErr.message);

      await fetchIntegrations();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao desconectar integração';
      return { success: false, error: msg };
    }
  };

  const salvarIntegracao = async (dto: SaveIntegrationDTO): Promise<{ success: boolean; error?: string }> => {
    if (!targetTenantId) return { success: false, error: 'Empresa não selecionada' };

    try {
      const fullPayload: Record<string, unknown> = {
        tenant_id: targetTenantId,
        provider: dto.provider,
        account_email: dto.account_email || null,
        access_token: dto.access_token || null,
        folder_id: dto.folder_id || null,
        folder_name: dto.folder_name || null,
        status: dto.status || 'connected',
        metadata: dto.metadata || {},
        updated_at: new Date().toISOString()
      };

      let { error: upsertErr } = await supabase
        .from('tenant_integrations')
        .upsert(fullPayload, { onConflict: 'tenant_id,provider' });

      if (upsertErr && upsertErr.message.includes('Could not find the')) {
        const basePayload: Record<string, unknown> = {
          tenant_id: targetTenantId,
          provider: dto.provider,
          access_token: dto.access_token || null,
          folder_id: dto.folder_id || null,
          updated_at: new Date().toISOString()
        };
        const resRetry = await supabase
          .from('tenant_integrations')
          .upsert(basePayload, { onConflict: 'tenant_id,provider' });
        upsertErr = resRetry.error;
      }

      if (upsertErr) throw new Error(upsertErr.message);

      await fetchIntegrations();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar integração';
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getIntegration = (provider: IntegrationProvider): TenantIntegration | null => {
    return integrations[provider] || null;
  };

  return {
    integrations,
    loading,
    error,
    getIntegration,
    desconectar,
    salvarIntegracao,
    refetch: fetchIntegrations
  };
}
