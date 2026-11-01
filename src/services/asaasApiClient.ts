import { supabase } from '../lib/supabase';
import type { AsaasConfig, AsaasEnvironment } from '../types/asaas.types';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const VERCEL_PROD_URL = 'https://terragest.agrodronesma.com.br';

export async function obterConfigAsaas(tenantIdProp?: string): Promise<AsaasConfig | null> {
  const activeTenant =
    tenantIdProp ||
    (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) ||
    DEFAULT_LEGACY_TENANT;

  // 1. Tenta ler da tabela tenant_integrations (metadata.asaas_config ou provider)
  try {
    const { data: rows } = await supabase
      .from('tenant_integrations')
      .select('provider, access_token, account_email, folder_name, metadata')
      .eq('tenant_id', activeTenant);

    for (const r of rows || []) {
      const meta = (r.metadata || {}) as Record<string, any>;
      if (meta?.asaas_config?.apiKey) {
        return meta.asaas_config as AsaasConfig;
      }
      if (String(r.provider).toUpperCase() === 'ASAAS' && r.access_token) {
        return {
          apiKey: r.access_token,
          environment: (meta.environment as AsaasEnvironment) || 'production',
          chavePix: meta.chavePix || '',
          tipoChavePix: meta.tipoChavePix || 'CNPJ',
          walletId: meta.walletId,
          accountName: r.folder_name || meta.accountName,
          accountEmail: r.account_email || meta.accountEmail,
          cnpj: meta.cnpj,
          connectedAt: meta.connectedAt
        };
      }
    }
  } catch {}

  // 2. Fallback no localStorage (para acesso instantâneo)
  if (typeof window !== 'undefined') {
    const localRaw = localStorage.getItem(`terragest_asaas_config_${activeTenant}`) || localStorage.getItem('terragest_asaas_config');
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw) as AsaasConfig;
        if (parsed?.apiKey) return parsed;
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

  const fullConfig: AsaasConfig = {
    ...config,
    apiKey: config.apiKey.trim(),
    connectedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`terragest_asaas_config_${activeTenant}`, JSON.stringify(fullConfig));
    localStorage.setItem('terragest_asaas_config', JSON.stringify(fullConfig));
  }

  // 1. Sincroniza ou cria Conta Bancária Asaas + Chave PIX em contas_bancarias
  try {
    const { data: contaExist } = await supabase
      .from('contas_bancarias')
      .select('id')
      .eq('tenant_id', activeTenant)
      .ilike('banco', '%Asaas%')
      .maybeSingle();

    const contaPayload = {
      tenant_id: activeTenant,
      nome_conta: fullConfig.accountName ? `Asaas - ${fullConfig.accountName}`.slice(0, 95) : 'Conta Digital Asaas',
      banco: 'Asaas IP S.A.',
      tipo_conta: 'CORRENTE',
      agencia: '0001',
      numero_conta: fullConfig.environment === 'sandbox' ? 'SANDBOX' : 'ATIVA',
      titular: fullConfig.accountName || null,
      documento_titular: fullConfig.cnpj || null,
      tipo_chave_pix: fullConfig.tipoChavePix || 'CNPJ',
      chave_pix: fullConfig.chavePix?.trim() || null,
      is_padrao: Boolean(fullConfig.chavePix?.trim()),
      ativo: true,
      updated_at: new Date().toISOString()
    };

    if (contaExist?.id) {
      await supabase.from('contas_bancarias').update(contaPayload).eq('id', contaExist.id);
    } else {
      await supabase.from('contas_bancarias').insert([contaPayload]);
    }
  } catch {}

  // 2. Salva na tabela tenant_integrations respeitando o CHECK constraint (provider='onedrive' ou existente)
  try {
    const { data: existingRows } = await supabase
      .from('tenant_integrations')
      .select('id, provider, metadata')
      .eq('tenant_id', activeTenant);

    const row = existingRows?.[0];
    if (row) {
      const novoMeta = { ...(row.metadata || {}), asaas_config: fullConfig };
      await supabase.from('tenant_integrations').update({ metadata: novoMeta, updated_at: new Date().toISOString() }).eq('id', row.id);
    } else {
      for (const prov of ['onedrive', 'dropbox', 'google_drive']) {
        const { error: insErr } = await supabase.from('tenant_integrations').insert([{
          tenant_id: activeTenant,
          provider: prov,
          status: 'connected',
          metadata: { asaas_config: fullConfig },
          updated_at: new Date().toISOString()
        }]);
        if (!insErr) break;
      }
    }
  } catch {}

  return { ok: true };
}

export async function chamarApiAsaas<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: unknown,
  overrideConfig?: { apiKey: string; environment: AsaasEnvironment }
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const cfg = overrideConfig || (await obterConfigAsaas());
  if (!cfg?.apiKey) return { ok: false, error: 'Conta Asaas não configurada. Conecte sua Chave de API primeiro.' };

  const isLocalOrNative =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const proxyUrl = isLocalOrNative ? `${VERCEL_PROD_URL}/api/asaas` : '/api/asaas';

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-asaas-key': cfg.apiKey.trim(), 'x-asaas-env': cfg.environment },
      body: JSON.stringify({ endpoint, method, payload, environment: cfg.environment })
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      return { ok: false, error: json.errors?.[0]?.description || json.error || `Erro Asaas (${res.status})` };
    }
    return { ok: true, data: json as T };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha de comunicação com o Asaas' };
  }
}
