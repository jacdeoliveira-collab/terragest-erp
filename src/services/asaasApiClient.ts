import { supabase } from '../lib/supabase';
import type { AsaasConfig, AsaasEnvironment } from '../types/asaas.types';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const VERCEL_PROD_URL = 'https://terragest.agrodronesma.com.br';

export async function obterConfigAsaas(tenantIdProp?: string): Promise<AsaasConfig | null> {
  try {
    const activeTenant =
      tenantIdProp ||
      (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) ||
      DEFAULT_LEGACY_TENANT;

    const { data } = await supabase
      .from('tenant_integrations')
      .select('access_token, account_email, folder_name, metadata, status')
      .eq('tenant_id', activeTenant)
      .eq('provider', 'ASAAS')
      .maybeSingle();

    if (data?.access_token) {
      const meta = (data.metadata || {}) as Record<string, string>;
      return {
        apiKey: data.access_token,
        environment: (meta.environment as AsaasEnvironment) || 'production',
        walletId: meta.walletId,
        accountName: data.folder_name || meta.accountName,
        accountEmail: data.account_email || meta.accountEmail,
        cnpj: meta.cnpj,
        connectedAt: meta.connectedAt
      };
    }
  } catch {}

  if (typeof window !== 'undefined') {
    const localRaw = localStorage.getItem('terragest_asaas_config');
    if (localRaw) {
      try {
        return JSON.parse(localRaw) as AsaasConfig;
      } catch {}
    }
  }
  return null;
}

export async function salvarConfigAsaasBanco(
  config: AsaasConfig,
  tenantIdProp?: string
): Promise<{ ok: boolean; error?: string }> {
  const activeTenant =
    tenantIdProp ||
    (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) ||
    DEFAULT_LEGACY_TENANT;

  if (typeof window !== 'undefined') {
    localStorage.setItem('terragest_asaas_config', JSON.stringify(config));
  }

  const payload = {
    tenant_id: activeTenant,
    provider: 'ASAAS',
    access_token: config.apiKey.trim(),
    account_email: config.accountEmail || null,
    folder_name: config.accountName || 'Conta Digital Asaas',
    status: 'connected',
    metadata: {
      environment: config.environment,
      walletId: config.walletId || '',
      accountName: config.accountName || '',
      cnpj: config.cnpj || '',
      connectedAt: new Date().toISOString()
    },
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('tenant_integrations')
    .upsert(payload, { onConflict: 'tenant_id,provider' });

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function chamarApiAsaas<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: unknown,
  overrideConfig?: { apiKey: string; environment: AsaasEnvironment }
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const cfg = overrideConfig || (await obterConfigAsaas());
  if (!cfg?.apiKey) {
    return { ok: false, error: 'Conta Asaas não configurada. Conecte sua Chave de API primeiro.' };
  }

  const isLocalOrNative =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'capacitor:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const proxyUrl = isLocalOrNative ? `${VERCEL_PROD_URL}/api/asaas` : '/api/asaas';

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-asaas-key': cfg.apiKey.trim(),
        'x-asaas-env': cfg.environment
      },
      body: JSON.stringify({
        endpoint,
        method,
        payload,
        environment: cfg.environment
      })
    });

    const json = await res.json();
    if (!res.ok || json.errors) {
      const msg = json.errors?.[0]?.description || json.error || `Erro Asaas (${res.status})`;
      return { ok: false, error: msg };
    }

    return { ok: true, data: json as T };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha de comunicação com o servidor Asaas'
    };
  }
}

