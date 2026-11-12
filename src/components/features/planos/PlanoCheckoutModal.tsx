import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, Loader2, MessageCircle, QrCode, RefreshCw, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PlanoCatalogoItem } from '../../../utils/planosCatalogo';
import { obterConfigAsaas } from '../../../services/asaasApiClient';

interface Props {
  plano: PlanoCatalogoItem;
  tenantId: string;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}

interface CheckoutData {
  assinaturaId: string;
  paymentId: string;
  pixQrCode?: string;
  pixCopiaCola?: string;
  invoiceUrl?: string;
  valor: number;
}

export const PlanoCheckoutModal: React.FC<Props> = ({ plano, tenantId, onClose, onConfirmed }) => {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pago, setPago] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const iniciar = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const localAsaas = await obterConfigAsaas(tenantId);
        const res = await fetch('/api/saas-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ action: 'criar', plano: plano.id, valor: plano.preco, tenantId, clientApiKey: localAsaas?.apiKey, clientEnvironment: localAsaas?.environment })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Erro ao gerar cobrança PIX');
        setCheckout(data);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Falha ao iniciar checkout');
      } finally {
        setLoading(false);
      }
    };
    iniciar();
  }, [plano.id, plano.preco, tenantId]);

  const handleCopy = () => {
    if (!checkout?.pixCopiaCola) return;
    navigator.clipboard.writeText(checkout.pixCopiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerificar = async () => {
    if (!checkout) return;
    setChecking(true);
    setErro(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/saas-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ action: 'verificar', assinaturaId: checkout.assinaturaId, paymentId: checkout.paymentId })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erro ao consultar pagamento');
      if (data.pago) {
        setPago(true);
        await onConfirmed();
      } else {
        setErro(`Pagamento ainda pendente (status: ${data.status || 'PENDING'}). Aguarde alguns segundos após pagar.`);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro na verificação');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Assinar Plano {plano.nome}</h3>
            <p className="text-sm text-emerald-400 font-semibold">R$ {plano.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {loading && <div className="flex flex-col items-center py-10 text-slate-300"><Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-400" /><p className="text-sm">Gerando PIX no Asaas...</p></div>}
        {pago && <div className="flex flex-col items-center py-8 text-center"><CheckCircle2 className="mb-3 h-12 w-12 text-emerald-400" /><h4 className="text-lg font-bold text-white">Pagamento Confirmado!</h4><p className="mt-1 text-sm text-slate-300">Seu plano {plano.nome} já foi ativado automaticamente.</p><button onClick={onClose} className="mt-5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">Acessar Módulos</button></div>}
        {!loading && !pago && checkout && (
          <div className="space-y-4">
            {checkout.pixQrCode && <div className="flex justify-center rounded-xl bg-white p-3"><img src={`data:image/png;base64,${checkout.pixQrCode}`} alt="QR Code PIX" className="h-44 w-44" /></div>}
            {checkout.pixCopiaCola && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><QrCode className="h-3.5 w-3.5" /> PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <input readOnly value={checkout.pixCopiaCola} className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200" />
                  <button onClick={handleCopy} className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600"><Copy className="h-3.5 w-3.5" />{copied ? 'Copiado!' : 'Copiar'}</button>
                </div>
              </div>
            )}
            {checkout.invoiceUrl && <a href={checkout.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"><ExternalLink className="h-3.5 w-3.5" /> Abrir fatura completa no Asaas</a>}
            {erro && <p className="rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-300 border border-amber-500/30">{erro}</p>}
            <button onClick={handleVerificar} disabled={checking} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60">
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Já paguei — Verificar e Liberar Plano
            </button>
          </div>
        )}
        {!loading && !checkout && erro && (
          <div className="space-y-4">
            <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30 leading-relaxed">{erro}</p>
            <p className="text-xs text-slate-400">Para ativar sua assinatura ou tirar dúvidas, fale com nossa equipe:</p>
            <a
              href={`https://wa.me/5598984242792?text=Ol%C3%A1%2C%20quero%20assinar%20o%20Plano%20${encodeURIComponent(plano.nome)}%20do%20TerraGest`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" /> Contratar via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

