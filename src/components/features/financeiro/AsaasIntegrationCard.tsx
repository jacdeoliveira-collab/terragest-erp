import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, RefreshCw, HelpCircle, Unlink, Eye, EyeOff, Lock } from 'lucide-react';
import { validarEConectarAsaas, consultarSaldoAsaas } from '../../../services/asaasFinanceiroService';
import { obterConfigAsaas } from '../../../services/asaasApiClient';
import { AsaasWebhookHelperBox } from './AsaasWebhookHelperBox';
import { useAuth } from '../../../hooks/useAuth';
import { useTenantContext } from '../../../contexts/TenantContext';
import { isMasterEmail } from '../../../services/adminService';
import type { AsaasConfig, AsaasEnvironment } from '../../../types/asaas.types';

interface Props {
  tenantId?: string;
  onDesconectar?: () => Promise<void>;
  onConectado?: () => void;
}

export const AsaasIntegrationCard: React.FC<Props> = ({ tenantId, onDesconectar, onConectado }) => {
  const { user, perfil_acesso: authPerfil } = useAuth();
  const { tenantAtivo, isMaster: isMasterTenant } = useTenantContext();
  const [config, setConfig] = useState<AsaasConfig | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState<AsaasEnvironment>('production');
  const [tipoChavePix, setTipoChavePix] = useState<AsaasConfig['tipoChavePix']>('CNPJ');
  const [chavePix, setChavePix] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const isAdmin = Boolean(
    isMasterTenant || (user && (isMasterEmail(user.email) || user.user_metadata?.is_super_admin === true)) ||
    (tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN') === 'ADMIN'
  );

  const carregarDados = async () => {
    const cfg = await obterConfigAsaas(tenantId);
    setConfig(cfg);
    if (cfg?.apiKey) {
      setApiKey(cfg.apiKey);
      setEnvironment(cfg.environment || 'production');
      setTipoChavePix(cfg.tipoChavePix || 'CNPJ');
      setChavePix(cfg.chavePix || cfg.cnpj || '');
      const res = await consultarSaldoAsaas();
      if (res.ok && res.balance !== undefined) setSaldo(res.balance);
    }
  };

  useEffect(() => { carregarDados(); }, [tenantId]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setFeedback(null);
    const res = await validarEConectarAsaas(apiKey, environment, chavePix, tipoChavePix, tenantId);
    setLoading(false);
    if (res.ok) {
      setSaldo(res.balance ?? 0);
      setFeedback({ tipo: 'ok', msg: `Conectado com sucesso à conta ${res.accountName || 'Asaas'} e Chave PIX sincronizada!` });
      await carregarDados();
      onConectado?.();
    } else {
      setFeedback({ tipo: 'erro', msg: res.error || 'Falha ao validar chave API.' });
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 text-left text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">A</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Banco Digital ASAAS (API v3 & PIX)</h3>
              {config?.apiKey ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Integrado ({config.environment === 'sandbox' ? 'Sandbox' : 'Produção'})
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-semibold">Aguardando Chave API</span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-semibold">
                <Lock className="w-2.5 h-2.5" /> Exclusivo Administradores
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Chave de API, Chave PIX Oficial, Boletos, QR Code PIX Dinâmico e Webhooks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saldo !== null && (
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Saldo Disponível Asaas</span>
              <span className="font-mono font-bold text-sm text-emerald-900">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          )}
          <button type="button" onClick={() => setShowGuide(!showGuide)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" /><span>{showGuide ? 'Ocultar Orientações' : 'Orientações API & Webhook'}</span>
          </button>
        </div>
      </div>

      {showGuide && <AsaasWebhookHelperBox />}

      {feedback && (
        <div className={`p-2.5 rounded-xl font-medium ${feedback.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {feedback.msg}
        </div>
      )}

      {!isAdmin ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" /><span>Apenas Administradores podem alterar a Chave de API e a Chave PIX da empresa.</span>
        </div>
      ) : (
        <form onSubmit={handleSalvar} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Ambiente Asaas *</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value as AsaasEnvironment)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900">
                <option value="production">Produção (Conta Real)</option>
                <option value="sandbox">Sandbox (Testes)</option>
              </select>
            </div>
            <div className="md:col-span-9">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Chave de API do Asaas (API Key) *</label>
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cole aqui sua chave $aact_..." className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900" />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 cursor-pointer">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Tipo da Chave PIX Asaas</label>
              <select value={tipoChavePix} onChange={(e) => setTipoChavePix(e.target.value as any)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900">
                <option value="CNPJ">CNPJ</option><option value="CPF">CPF</option><option value="EMAIL">E-mail</option><option value="TELEFONE">Celular / Telefone</option><option value="ALEATORIA">Chave Aleatória (EVP)</option>
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Chave PIX Oficial da Conta Asaas (Para Orçamentos e Recebimentos)</label>
              <input type="text" value={chavePix} onChange={(e) => setChavePix(e.target.value)} placeholder="Informe sua chave PIX cadastrada no Asaas..." className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900" />
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer">
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>{loading ? 'Validando...' : config?.apiKey ? 'Salvar API & PIX' : 'Conectar Asaas'}</span>
              </button>
              {config?.apiKey && onDesconectar && (
                <button type="button" onClick={onDesconectar} title="Desconectar Asaas" className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl cursor-pointer"><Unlink className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
