import { supabase } from '../lib/supabase';
import type { AsaasConfig, AsaasEnvironment, GatewayProvider } from '../types/asaas.types';
import { obterMetadataBanco } from '../utils/bancosProvidersCatalog';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const VERCEL_PROD_URL = 'https://terragest.agrodronesma.com.br';
const getActiveTenant = (prop?: string) => prop || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) || DEFAULT_LEGACY_TENANT;

export async function obterConfigAsaas(tenantIdProp?: string): Promise<AsaasConfig | null> {
  const activeTenant = getActiveTenant(tenantIdProp);
  try {
    const { data: rows } = await supabase.from('tenant_integrations').select('metadata').eq('tenant_id', activeTenant);
    for (const r of rows || []) {
      const meta = (r.metadata || {}) as Record<string, any>;
      if (meta?.asaas_config?.apiKey || meta?.asaas_config?.chavePix || meta?.asaas_config?.nomeBancoCustom) {
        return meta.asaas_config as AsaasConfig;
      }
    }
  } catch {}

  if (typeof window !== 'undefined') {
    const localRaw = localStorage.getItem(`terragest_asaas_config_${activeTenant}`) || localStorage.getItem('terragest_asaas_config');
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw) as AsaasConfig;
        if (parsed?.apiKey || parsed?.chavePix || parsed?.nomeBancoCustom) return parsed;
      } catch {}
    }
  }
  return null;
}

export async function salvarConfigAsaasBanco(config: AsaasConfig, tenantIdProp?: string): Promise<{ ok: boolean; error?: string }> {
  const activeTenant = getActiveTenant(tenantIdProp);
  const metaBanco = obterMetadataBanco(config.provider);
  const nomeBancoFinal = config.provider === 'OUTRO_BANCO' && config.nomeBancoCustom?.trim()
    ? config.nomeBancoCustom.trim()
    : metaBanco.nome;

  const fullConfig: AsaasConfig = {
    ...config,
    provider: config.provider || 'ASAAS',
    nomeBancoCustom: config.nomeBancoCustom?.trim() || '',
    agenciaCustom: config.agenciaCustom?.trim() || '',
    contaCustom: config.contaCustom?.trim() || '',
    apiBaseUrlCustom: config.apiBaseUrlCustom?.trim() || '',
    apiKey: config.apiKey?.trim() || '',
    clientId: config.clientId?.trim() || '',
    webhookToken: config.webhookToken?.trim() || '',
    chavePix: config.chavePix?.trim() || '',
    connectedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`terragest_asaas_config_${activeTenant}`, JSON.stringify(fullConfig));
    localStorage.setItem('terragest_asaas_config', JSON.stringify(fullConfig));
  }

  try {
    const { data: contaExist } = await supabase
      .from('contas_bancarias')
      .select('id')
      .eq('tenant_id', activeTenant)
      .eq('is_padrao', true)
      .maybeSingle();

    const contaPayload = {
      tenant_id: activeTenant,
      nome_conta: fullConfig.accountName ? `${nomeBancoFinal} - ${fullConfig.accountName}`.slice(0, 95) : nomeBancoFinal.slice(0, 95),
      banco: nomeBancoFinal.slice(0, 95),
      tipo_conta: 'CORRENTE',
      agencia: fullConfig.agenciaCustom || '0001',
      numero_conta: fullConfig.contaCustom || (fullConfig.environment === 'sandbox' ? 'SANDBOX' : 'PRODUCAO'),
      titular: fullConfig.accountName || 'Titular Conta Principal',
      documento_titular: fullConfig.cnpj || null,
      tipo_chave_pix: fullConfig.tipoChavePix || 'CPF',
      chave_pix: fullConfig.chavePix || null,
      is_padrao: true,
      ativo: true,
      updated_at: new Date().toISOString()
    };

    if (contaExist?.id) {
      await supabase.from('contas_bancarias').update(contaPayload).eq('id', contaExist.id);
    } else {
      await supabase.from('contas_bancarias').insert([contaPayload]);
    }
  } catch {}

  try {
    const { data: existingRows } = await supabase.from('tenant_integrations').select('id, metadata').eq('tenant_id', activeTenant);
    const row = existingRows?.[0];
    if (row) {
      const novoMeta = { ...(row.metadata || {}), asaas_config: fullConfig };
      await supabase.from('tenant_integrations').update({ metadata: novoMeta, updated_at: new Date().toISOString() }).eq('id', row.id);
    } else {
      await supabase.from('tenant_integrations').insert([{
        tenant_id: activeTenant, provider: 'google_drive', status: 'connected',
        metadata: { asaas_config: fullConfig }, updated_at: new Date().toISOString()
      }]);
    }
  } catch {}

  return { ok: true };
}

export async function desconectarConfigAsaasBanco(tenantIdProp?: string): Promise<void> {
  const activeTenant = getActiveTenant(tenantIdProp);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`terragest_asaas_config_${activeTenant}`);
    localStorage.removeItem('terragest_asaas_config');
  }
  try {
    const { data: rows } = await supabase.from('tenant_integrations').select('id, metadata').eq('tenant_id', activeTenant);
    for (const r of rows || []) {
      const meta = { ...(r.metadata || {}) } as Record<string, any>;
      delete meta.asaas_config;
      await supabase.from('tenant_integrations').update({ metadata: meta }).eq('id', r.id);
    }
  } catch {}
}

export async function chamarApiAsaas<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: unknown,
  overrideConfig?: { apiKey: string; environment: AsaasEnvironment; provider?: GatewayProvider }
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const cfg = overrideConfig || (await obterConfigAsaas());
  if (!cfg?.apiKey) return { ok: false, error: 'Banco/API não configurado. Cadastre sua Chave de API na planilha em Minha Empresa.' };

  const provider = cfg.provider || 'ASAAS';
  const isNativeApk = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';
  const proxyUrl = isNativeApk ? `${VERCEL_PROD_URL}/api/asaas` : '/api/asaas';

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-asaas-key': cfg.apiKey.trim(), 'x-asaas-env': cfg.environment, 'x-bank-provider': provider },
      body: JSON.stringify({ endpoint, method, payload, environment: cfg.environment, provider })
    });
    const json = await res.json();
    if (!res.ok || json.errors) return { ok: false, error: json.errors?.[0]?.description || json.message || json.error || `Erro API Bancária (${res.status})` };
    return { ok: true, data: json as T };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha de comunicação com o Banco Digital' };
  }
}
