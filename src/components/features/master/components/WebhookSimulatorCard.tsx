import React, { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';
import type { WebhookLogItem } from '../types/master.types';

interface WebhookSimulatorCardProps {
  onDisparar: (log: Omit<WebhookLogItem, 'id' | 'data'>) => void;
}

export const WebhookSimulatorCard: React.FC<WebhookSimulatorCardProps> = ({ onDisparar }) => {
  const [gateway, setGateway] = useState<string>('Mercado Pago');
  const [evento, setEvento] = useState<string>('payment.approved');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  const endpointUrl = `${window.location.origin}/api/webhooks/payment`;

  const payloadExemplo = JSON.stringify(
    {
      action: evento,
      data: { id: `tx_mp_${Math.floor(100000 + Math.random() * 900000)}` },
      date_created: new Date().toISOString(),
      live_mode: true,
      status: evento === 'payment.failed' ? 'rejected' : 'approved',
      external_reference: 'tenant_onb_init_01',
    },
    null,
    2
  );

  const handleCopyEndpoint = async () => {
    await navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisparar = () => {
    setIsFiring(true);
    setTimeout(() => {
      onDisparar({
        gateway,
        evento,
        status: evento === 'payment.failed' ? 'falha' : 'sucesso',
        resposta: evento === 'payment.failed' ? 'HTTP 400 - Transação Rejeitada' : 'HTTP 200 - Tenant Ativado',
      });
      setIsFiring(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
      {/* Box Simulador */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Simulador de Webhook</h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Homologação</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Gateway</label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs p-2 focus:outline-none"
            >
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Asaas">Asaas</option>
              <option value="Stripe">Stripe</option>
              <option value="PagSeguro">PagSeguro</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Gatilho (Evento)</label>
            <select
              value={evento}
              onChange={(e) => setEvento(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs p-2 focus:outline-none"
            >
              <option value="payment.approved">payment.approved</option>
              <option value="subscription.renewed">subscription.renewed</option>
              <option value="payment.failed">payment.failed</option>
            </select>
          </div>
        </div>

        <pre className="bg-[#0a0d12] border border-[#21262d] rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-36">
          {payloadExemplo}
        </pre>

        <button
          onClick={handleDisparar}
          disabled={isFiring}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>{isFiring ? 'Disparando Webhook...' : 'Disparar Webhook'}</span>
        </button>
      </div>

      {/* Box Endpoint */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Endpoint para Gateways</h3>
          <p className="text-[11px] text-gray-400">
            Ativação automática atualiza o tenant de <code className="text-amber-400 font-mono">pending_payment</code> para{' '}
            <code className="text-emerald-400 font-mono">active</code> e libera o login antecipado.
          </p>

          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-2 font-mono text-xs text-gray-300">
            <span className="truncate flex-1">{endpointUrl}</span>
            <button
              onClick={handleCopyEndpoint}
              className="px-2.5 py-1 bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 rounded border border-[#30363d] text-xs font-medium flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 space-y-1 text-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Segurança de Webhook:</span>
          <p className="text-[11px] text-gray-400">Validação criptográfica de assinatura HMAC SHA256 ativa nos cabeçalhos.</p>
        </div>
      </div>
    </div>
  );
};
