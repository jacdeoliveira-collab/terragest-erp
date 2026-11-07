import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, RefreshCw, HelpCircle, Unlink, Lock, FileSpreadsheet, Upload, Landmark } from 'lucide-react';
import { validarEConectarAsaas, consultarSaldoAsaas } from '../../../services/asaasFinanceiroService';
import { obterConfigAsaas } from '../../../services/asaasApiClient';
import { obterMetadataBanco } from '../../../utils/bancosProvidersCatalog';
import { AsaasWebhookHelperBox } from './AsaasWebhookHelperBox';
import { AsaasPlanilhaTable } from './AsaasPlanilhaTable';
import { exportarPlanilhaCredenciaisAsaas, importarPlanilhaCredenciaisAsaas } from '../../../utils/asaasPlanilhaExcelHelper';
import { useAuth } from '../../../hooks/useAuth';
import { useTenantContext } from '../../../contexts/TenantContext';
import { isMasterEmail } from '../../../services/adminService';
import type { AsaasConfig, AsaasEnvironment, GatewayProvider } from '../../../types/asaas.types';

interface Props { tenantId?: string; onDesconectar?: () => Promise<void>; onConectado?: () => void; }

export const AsaasIntegrationCard: React.FC<Props> = ({ tenantId, onDesconectar, onConectado }) => {
  const { user, perfil_acesso: authPerfil } = useAuth();
  const { tenantAtivo, isMaster: isMasterTenant } = useTenantContext();
  const [config, setConfig] = useState<AsaasConfig | null>(null);
  const [provider, setProvider] = useState<GatewayProvider>('ASAAS');
  const [nomeBancoCustom, setNomeBancoCustom] = useState(''); const [agenciaCustom, setAgenciaCustom] = useState('');
  const [contaCustom, setContaCustom] = useState(''); const [apiBaseUrlCustom, setApiBaseUrlCustom] = useState('');
  const [apiKey, setApiKey] = useState(''); const [clientId, setClientId] = useState('');
  const [environment, setEnvironment] = useState<AsaasEnvironment>('production');
  const [webhookToken, setWebhookToken] = useState('');
  const [tipoChavePix, setTipoChavePix] = useState<AsaasConfig['tipoChavePix']>('CPF');
  const [chavePix, setChavePix] = useState(''); const [showGuide, setShowGuide] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null); const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const isAdmin = Boolean(
    isMasterTenant || (user && (isMasterEmail(user.email) || user.user_metadata?.is_super_admin === true)) ||
    (tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN') === 'ADMIN'
  );
  const metaBanco = obterMetadataBanco(provider);

  const carregarDados = async () => {
    const cfg = await obterConfigAsaas(tenantId);
    setConfig(cfg);
    if (cfg) {
      setProvider(cfg.provider || 'ASAAS'); setNomeBancoCustom(cfg.nomeBancoCustom || '');
      setAgenciaCustom(cfg.agenciaCustom || ''); setContaCustom(cfg.contaCustom || '');
      setApiBaseUrlCustom(cfg.apiBaseUrlCustom || ''); setApiKey(cfg.apiKey || '');
      setClientId(cfg.clientId || ''); setEnvironment(cfg.environment || 'production');
      setWebhookToken(cfg.webhookToken || ''); setTipoChavePix(cfg.tipoChavePix || 'CPF');
      setChavePix(cfg.chavePix || cfg.cnpj || '');
      if (!cfg.provider || cfg.provider === 'ASAAS') {
        const res = await consultarSaldoAsaas();
        if (res.ok && res.balance !== undefined) setSaldo(res.balance);
      } else setSaldo(null);
    }
  };

  useEffect(() => { carregarDados(); }, [tenantId]);

  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lido = await importarPlanilhaCredenciaisAsaas(file);
    if (lido.provider) setProvider(lido.provider);
    if (lido.nomeBancoCustom) setNomeBancoCustom(lido.nomeBancoCustom);
    if (lido.agenciaCustom) setAgenciaCustom(lido.agenciaCustom);
    if (lido.contaCustom) setContaCustom(lido.contaCustom);
    if (lido.apiKey) setApiKey(lido.apiKey); if (lido.clientId) setClientId(lido.clientId);
    if (lido.environment) setEnvironment(lido.environment); if (lido.webhookToken) setWebhookToken(lido.webhookToken);
    if (lido.tipoChavePix) setTipoChavePix(lido.tipoChavePix); if (lido.chavePix) setChavePix(lido.chavePix);
    setFeedback({ tipo: 'ok', msg: 'Planilha Excel carregada! Clique em Salvar Planilha no Banco para validar.' });
    e.target.value = '';
  };

  const handleSalvar = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    setLoading(true); setFeedback(null);
    const res = await validarEConectarAsaas(apiKey, environment, chavePix, tipoChavePix, webhookToken, tenantId, provider, clientId, { nomeBancoCustom, agenciaCustom, contaCustom, apiBaseUrlCustom });
    setLoading(false);
    if (res.ok) {
      setSaldo(res.balance ?? null);
      setFeedback({ tipo: 'ok', msg: `Planilha sincronizada no Supabase! Banco: ${nomeBancoCustom || metaBanco.nome}` });
      await carregarDados(); onConectado?.();
    } else setFeedback({ tipo: 'erro', msg: res.error || 'Falha ao validar credenciais do banco.' });
  };

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 text-left text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${metaBanco.corBadge}`}><Landmark className="w-5 h-5" /></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Planilha Multi-Banco de API, Webhook & PIX (PF / PJ)</h3>
              {config?.apiKey || config?.chavePix || config?.nomeBancoCustom ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" /> {config.nomeBancoCustom || metaBanco.id} Ativo</span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-semibold">Não configurado</span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">Selecione o seu Banco (Asaas, Mercado Pago, Inter, Cora, Efí, Sicoob ou Outro) e salve na planilha do Supabase</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saldo !== null && (
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Saldo em Conta</span>
              <span className="font-mono font-bold text-sm text-emerald-900">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          )}
          <button type="button" onClick={() => exportarPlanilhaCredenciaisAsaas({ provider, nomeBancoCustom, agenciaCustom, contaCustom, apiKey, clientId, environment, webhookToken, tipoChavePix, chavePix, accountName: config?.accountName, cnpj: config?.cnpj })} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /><span>Baixar Planilha (.xlsx)</span>
          </button>
          <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
            <Upload className="w-3.5 h-3.5" /><span>Importar (.xlsx)</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportarExcel} className="hidden" />
          </label>
          <button type="button" onClick={() => setShowGuide(!showGuide)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" /><span>{showGuide ? 'Fechar Ajuda (?)' : 'Ajuda dos Bancos (?)'}</span>
          </button>
        </div>
      </div>

      {showGuide && <AsaasWebhookHelperBox selectedProvider={provider} />}
      {feedback && <div className={`p-2.5 rounded-xl font-medium ${feedback.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{feedback.msg}</div>}

      {!isAdmin ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2"><Lock className="w-4 h-4" /><span>Apenas Administradores podem visualizar, editar ou remover a planilha bancária.</span></div>
      ) : (
        <div className="space-y-3">
          <AsaasPlanilhaTable
            provider={provider} setProvider={setProvider} nomeBancoCustom={nomeBancoCustom} setNomeBancoCustom={setNomeBancoCustom}
            agenciaCustom={agenciaCustom} setAgenciaCustom={setAgenciaCustom} contaCustom={contaCustom} setContaCustom={setContaCustom}
            apiBaseUrlCustom={apiBaseUrlCustom} setApiBaseUrlCustom={setApiBaseUrlCustom} environment={environment} setEnvironment={setEnvironment}
            apiKey={apiKey} setApiKey={setApiKey} clientId={clientId} setClientId={setClientId} webhookToken={webhookToken} setWebhookToken={setWebhookToken}
            tipoChavePix={tipoChavePix} setTipoChavePix={setTipoChavePix} chavePix={chavePix} setChavePix={setChavePix} onOpenHelp={() => setShowGuide(true)}
          />
          <div className="flex items-center justify-end gap-2">
            {(config?.apiKey || config?.chavePix || config?.nomeBancoCustom) && onDesconectar && (
              <button type="button" onClick={async () => { await onDesconectar(); setApiKey(''); setClientId(''); setWebhookToken(''); setChavePix(''); setNomeBancoCustom(''); setSaldo(null); setConfig(null); }} className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer"><Unlink className="w-3.5 h-3.5" /><span>Limpar Planilha</span></button>
            )}
            <button type="button" onClick={handleSalvar} disabled={loading} className="inline-flex items-center gap-1.5 py-2 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer">
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>{loading ? 'Validando e Salvando...' : 'Salvar Planilha Bancária no Supabase'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
