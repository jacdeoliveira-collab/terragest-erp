import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, Save } from 'lucide-react';
import { obterConfigAsaas, salvarConfigAsaasBanco } from '../../../../services/asaasApiClient';
import { supabase } from '../../../../lib/supabase';
import { DEFAULT_LEGACY_TENANT } from '../../../../utils/tenantFilter';

export const MasterAsaasKeyBar: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [conectado, setConectado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      const local = await obterConfigAsaas(DEFAULT_LEGACY_TENANT);
      if (local?.apiKey) {
        setApiKey(local.apiKey);
        setEnvironment(local.environment || 'production');
        setConectado(true);
        return;
      }
      const { data } = await supabase.rpc('obter_asaas_master_checkout');
      const cfg = Array.isArray(data) ? data[0] : data;
      if (cfg?.apiKey) {
        setApiKey(cfg.apiKey);
        setEnvironment(cfg.environment || 'production');
        setConectado(true);
      } else {
        setAberto(true);
      }
    };
    carregar();
  }, []);

  const handleSalvar = async () => {
    if (!apiKey.trim()) return;
    setSalvando(true);
    setMsg(null);
    await salvarConfigAsaasBanco({ provider: 'ASAAS', apiKey: apiKey.trim(), environment }, DEFAULT_LEGACY_TENANT);
    try {
      await supabase.rpc('salvar_asaas_master_checkout', { p_api_key: apiKey.trim(), p_environment: environment });
    } catch {}
    setConectado(true);
    setSalvando(false);
    setAberto(false);
    setMsg('Chave Asaas Master conectada para receber assinaturas!');
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 text-xs space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className={`w-4 h-4 ${conectado ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="font-bold text-white">Gateway Asaas Master (Recebimento das Assinaturas SaaS):</span>
          {conectado ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" /> Conectado ({environment === 'sandbox' ? 'Sandbox' : 'Produção'})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold">Chave de API não configurada</span>
          )}
        </div>
        <button type="button" onClick={() => setAberto(!aberto)} className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer">
          {aberto ? 'Ocultar' : conectado ? 'Trocar Chave de API Asaas' : 'Configurar Chave de API Asaas'}
        </button>
      </div>

      {msg && <p className="text-[11px] text-emerald-400 font-semibold">{msg}</p>}

      {aberto && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <input
            type="password"
            placeholder="Cole aqui a Chave de API do Asaas ($aact_...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="sm:col-span-2 px-3 py-1.5 bg-[#11161d] border border-[#30363d] rounded-lg text-white font-mono text-xs"
          />
          <select value={environment} onChange={(e) => setEnvironment(e.target.value as 'production' | 'sandbox')} className="px-2.5 py-1.5 bg-[#11161d] border border-[#30363d] rounded-lg text-white font-semibold">
            <option value="production">Asaas Produção</option>
            <option value="sandbox">Asaas Sandbox</option>
          </select>
          <button type="button" onClick={handleSalvar} disabled={salvando || !apiKey.trim()} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Salvar Chave Master'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
