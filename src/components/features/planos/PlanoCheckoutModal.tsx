import React, { useState, useMemo } from 'react';
import { CheckCircle2, Copy, ExternalLink, Loader2, MessageCircle, QrCode, RefreshCw, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PlanoSaasRecord } from '../../../types/planos.types';
import { obterConfigAsaas } from '../../../services/asaasApiClient';
import { useTenantContext } from '../../../contexts/TenantContext';
import { usePlanosContext } from '../../../contexts/PlanosContext';
import { calcularProRataMudancaPlano } from '../../../utils/planoProRataCalculator';
import { TermoAdesaoPlanoBox } from './TermoAdesaoPlanoBox';
import { TrocaPlanoResumoDialog } from './TrocaPlanoResumoDialog';

interface Props { plano: PlanoSaasRecord; tenantId: string; onClose: () => void; onConfirmed: () => Promise<void>; }
interface CheckoutData { assinaturaId: string; paymentId: string; pixQrCode?: string; pixCopiaCola?: string; invoiceUrl?: string; valor: number; }

export const PlanoCheckoutModal: React.FC<Props> = ({ plano, tenantId, onClose, onConfirmed }) => {
  const { tenantAtivo } = useTenantContext();
  const { planos } = usePlanosContext();
  const calculo = useMemo(() => calcularProRataMudancaPlano(tenantAtivo, plano, planos), [tenantAtivo, plano, planos]);

  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [needsCpfCnpj, setNeedsCpfCnpj] = useState(false);
  const [cpfCnpjInput, setCpfCnpjInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [pago, setPago] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);

  const confirmarAcaoPlano = async (cpfCnpjOverride?: string) => {
    if (!aceitoTermos) return setErro('Marque a concordância com o Contrato de Adesão e LGPD.');
    setLoading(true); setErro(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const localAsaas = await obterConfigAsaas(tenantId);
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (!calculo.precisaPagamentoImediato) {
        const res = await fetch('/api/saas-checkout', {
          method: 'POST', headers,
          body: JSON.stringify({
            action: 'trocar_plano_com_credito', tenantId, plano: plano.codigo,
            valorMensalRecorrente: plano.valor_mensal, limiteUsuarios: plano.limite_usuarios,
            novaDataVencimento: calculo.novaDataVencimento, clientApiKey: localAsaas?.apiKey, clientEnvironment: localAsaas?.environment
          })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Falha ao trocar plano com saldo de crédito');
        setPago(true); await onConfirmed(); return;
      }

      const res = await fetch('/api/saas-checkout', {
        method: 'POST', headers,
        body: JSON.stringify({
          action: 'criar', plano: plano.codigo, valor: calculo.valorCobrarAgora,
          valorMensalRecorrente: plano.valor_mensal, limiteUsuarios: plano.limite_usuarios,
          diasAcessoTotalNovo: calculo.diasAcessoTotalNovo, tipoMudanca: calculo.tipoMudanca,
          tenantId, cpfCnpj: cpfCnpjOverride || undefined,
          clientApiKey: localAsaas?.apiKey, clientEnvironment: localAsaas?.environment
        })
      });
      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};
      if (!res.ok || data.error) {
        if (data.needsCpfCnpj) setNeedsCpfCnpj(true);
        throw new Error(data.error || 'Erro ao gerar cobrança PIX');
      }
      setNeedsCpfCnpj(false); setCheckout(data);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao processar plano');
    } finally { setLoading(false); }
  };

  const handleVerificar = async () => {
    if (!checkout) return;
    setChecking(true); setErro(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/saas-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          action: 'verificar', assinaturaId: checkout.assinaturaId, paymentId: checkout.paymentId,
          tenantId, plano: plano.codigo, valorMensalRecorrente: plano.valor_mensal,
          limiteUsuarios: plano.limite_usuarios, diasAcessoTotalNovo: calculo.diasAcessoTotalNovo
        })
      });
      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};
      if (!res.ok || data.error) throw new Error(data.error || 'Erro ao consultar pagamento');
      if (data.pago) { setPago(true); await onConfirmed(); }
      else setErro(`Pagamento pendente (${data.status || 'PENDING'}). Aguarde alguns segundos após pagar.`);
    } catch (err) { setErro(err instanceof Error ? err.message : 'Erro na verificação'); } finally { setChecking(false); }
  };

  const isTrocaExistente = calculo.tipoMudanca !== 'NOVA_ASSINATURA';
  const planoAtualObj = planos.find((p) => p.codigo.toUpperCase() === calculo.planoAtualCodigo.toUpperCase()) || null;
  const tituloPlano = isTrocaExistente ? `Trocar para ${plano.nome}` : (plano.nome.toLowerCase().startsWith('plano') ? `Assinar ${plano.nome}` : `Assinar Plano ${plano.nome}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="dark-surface w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl text-left">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{tituloPlano}</h3>
            <p className="text-xs text-emerald-400 font-semibold">Mensalidade: R$ {plano.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês • Próximo vencimento: {calculo.novaDataVencimentoBr}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        {!checkout && !pago && (
          <div className="space-y-3.5">
            {isTrocaExistente && <TrocaPlanoResumoDialog calculo={calculo} planoAtualObj={planoAtualObj} planoNovo={plano} />}
            <TermoAdesaoPlanoBox plano={plano} aceito={aceitoTermos} onChangeAceito={setAceitoTermos} calculoProRata={isTrocaExistente ? null : calculo} dark />
            {needsCpfCnpj && <input type="text" placeholder="Digite o CPF ou CNPJ da empresa para o Asaas" value={cpfCnpjInput} onChange={(e) => setCpfCnpjInput(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white" />}
            {erro && <p className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-300 border border-red-500/30">{erro}</p>}
            <button type="button" onClick={() => confirmarAcaoPlano(cpfCnpjInput)} disabled={loading || !aceitoTermos} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                : !calculo.precisaPagamentoImediato ? `Confirmar Troca com Créditos (Vencimento: ${calculo.novaDataVencimentoBr})`
                : calculo.estaAtrasado ? `Regularizar & Gerar PIX Imediato (R$ ${calculo.valorCobrarAgora.toFixed(2)})`
                : `Confirmar Contrato e Gerar QR Code PIX (R$ ${calculo.valorCobrarAgora.toFixed(2)})`}
            </button>
          </div>
        )}

        {pago && <div className="flex flex-col items-center py-6 text-center"><CheckCircle2 className="mb-3 h-12 w-12 text-emerald-400" /><h4 className="text-lg font-bold text-white">Plano Atualizado com Sucesso!</h4><p className="mt-1 text-xs text-slate-300">{plano.nome} ativo até <strong>{calculo.novaDataVencimentoBr}</strong> ({calculo.diasAcessoTotalNovo} dias).</p><button onClick={onClose} className="mt-4 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer">Acessar Módulos</button></div>}
        {!loading && !pago && checkout && (
          <div className="space-y-3.5">
            {checkout.pixQrCode && <div className="flex justify-center rounded-xl bg-white p-3"><img src={`data:image/png;base64,${checkout.pixQrCode}`} alt="QR Code PIX" className="h-40 w-40" /></div>}
            {checkout.pixCopiaCola && (
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-slate-400"><QrCode className="h-3.5 w-3.5" /> PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <input readOnly value={checkout.pixCopiaCola} className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200" />
                  <button onClick={() => { navigator.clipboard.writeText(checkout.pixCopiaCola || ''); setCopied(true); setTimeout(() => setCopied(false), 2500); }} className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 cursor-pointer"><Copy className="h-3.5 w-3.5" />{copied ? 'Copiado!' : 'Copiar'}</button>
                </div>
              </div>
            )}
            {checkout.invoiceUrl && <a href={checkout.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"><ExternalLink className="h-3.5 w-3.5" /> Abrir fatura no Asaas</a>}
            {erro && <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-300 border border-amber-500/30">{erro}</p>}
            <button onClick={handleVerificar} disabled={checking} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60 cursor-pointer">{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Já paguei — Verificar e Liberar Plano</button>
            <a href={`https://wa.me/5599981228668?text=Ol%C3%A1%2C%20suporte%20${encodeURIComponent(plano.nome)}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"><MessageCircle className="h-4 w-4 text-emerald-400" /> Suporte WhatsApp</a>
          </div>
        )}
      </div>
    </div>
  );
};
