import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, BellRing, HelpCircle } from 'lucide-react';
import { CATALOGO_BANCOS_API, obterMetadataBanco } from '../../../utils/bancosProvidersCatalog';
import type { GatewayProvider } from '../../../types/asaas.types';

export const WEBHOOK_URL_ASAAS = 'https://terragest.agrodronesma.com.br/api/asaas-webhook';

interface Props {
  selectedProvider?: GatewayProvider;
}

export const AsaasWebhookHelperBox: React.FC<Props> = ({ selectedProvider = 'ASAAS' }) => {
  const [abaBanco, setAbaBanco] = useState<GatewayProvider>(selectedProvider);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setAbaBanco(selectedProvider);
  }, [selectedProvider]);

  const meta = obterMetadataBanco(abaBanco);

  const copiarUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_URL_ASAAS);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3 text-[11px] text-blue-950 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Manual Passo a Passo de Integração por Banco (Clique no seu banco abaixo):</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {CATALOGO_BANCOS_API.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setAbaBanco(b.id)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                abaBanco === b.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white/80 text-blue-900 hover:bg-white border border-blue-200'
              }`}
            >
              {b.id === 'OUTRO_BANCO' ? 'OUTRO BANCO' : b.id.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5 bg-white/90 p-3 rounded-xl border border-blue-200/80">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Como configurar: {meta.nome}</span>
            </p>
            {meta.urlPortalDev && (
              <a href={meta.urlPortalDev} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 underline shrink-0">
                <span>Abrir Painel</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <div className="space-y-1 text-slate-700 leading-relaxed pt-1">
            {meta.passosTutorial.map((passo, idx) => (
              <p key={idx} className="text-[11px]">{passo}</p>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-3 bg-white/90 border border-blue-200/80 rounded-xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <p className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
              <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Configuração do Webhook Automático ({meta.id}):</span>
            </p>
            <p className="text-[10px] text-gray-600">
              Para dar baixa automática no Contas a Receber quando o cliente pagar o PIX ou Boleto, cole esta URL no painel do seu banco:
            </p>
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200">
              <code className="text-[10px] font-mono text-slate-900 truncate select-all">{WEBHOOK_URL_ASAAS}</code>
              <button type="button" onClick={copiarUrl} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold shrink-0 cursor-pointer">
                {copiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiado ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>
          <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-[10px] text-emerald-950 font-medium">
            <b>Orientação do Webhook ({meta.id}):</b> {meta.dicaWebhook}
          </div>
        </div>
      </div>
    </div>
  );
};
