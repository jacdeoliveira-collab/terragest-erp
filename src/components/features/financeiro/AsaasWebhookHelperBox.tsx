import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, BellRing } from 'lucide-react';

export const WEBHOOK_URL_ASAAS = 'https://terragest.agrodronesma.com.br/api/asaas-webhook';

export const AsaasWebhookHelperBox: React.FC = () => {
  const [copiado, setCopiado] = useState(false);

  const copiarUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_URL_ASAAS);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-[11px] text-blue-950">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="font-bold text-blue-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" /> 1. Como gerar a Chave de API no Asaas:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-900">
            <li>
              Acesse <a href="https://www.asaas.com" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">asaas.com <ExternalLink className="w-2.5 h-2.5" /></a> &rarr; <b>Configurações da Conta</b> &rarr; aba <b>Integrações</b>.
            </li>
            <li>Em <b>Chaves de API</b>, clique em <b>Gerar nova chave de API</b> e copie o código iniciado por <code>$aact_...</code>.</li>
            <li>Informe abaixo também a sua <b>Chave PIX Asaas</b> para que ela fique salva como padrão nos Orçamentos e Faturas.</li>
          </ol>
        </div>

        <div className="space-y-1.5 p-2.5 bg-white/90 border border-blue-200 rounded-xl">
          <p className="font-bold text-blue-900 flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-emerald-600" /> 2. Configuração da aba Webhooks no Asaas:
          </p>
          <p className="text-[10px] text-gray-600">
            Para dar baixa automática no Contas a Receber assim que o cliente pagar o PIX ou Boleto, preencha no Asaas:
          </p>
          <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <code className="text-[10px] font-mono text-slate-900 truncate">{WEBHOOK_URL_ASAAS}</code>
            <button type="button" onClick={copiarUrl} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold shrink-0 cursor-pointer">
              {copiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiado ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
          <p className="text-[10px] text-blue-900">
            • <b>Versão da API:</b> <code>v3</code> | <b>Tipo de envio:</b> <code>Sequencial (SEQUENTIALLY)</code> | <b>Eventos:</b> Cobranças (<code>PAYMENT_RECEIVED</code>, <code>PAYMENT_CONFIRMED</code>)
          </p>
        </div>
      </div>
    </div>
  );
};
