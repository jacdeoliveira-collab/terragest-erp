import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { emitirCobrancaAsaas } from '../../../services/asaasFinanceiroService';
import type { MedicaoItem } from '../../../types/faturamento.types';
import type { AsaasChargeResult } from '../../../types/asaas.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titulo: MedicaoItem | null;
}

const formatBRL = (v: number) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const AsaasCobrancaModal: React.FC<Props> = ({ isOpen, onClose, titulo }) => {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO' | 'UNDEFINED'>('UNDEFINED');
  const [valor, setValor] = useState(0);
  const [vencimento, setVencimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cobranca, setCobranca] = useState<AsaasChargeResult | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!titulo) return;
    setCpfCnpj(titulo.cliente_documento || '');
    setTelefone(titulo.cliente_telefone || '');
    const saldo = titulo.saldo_restante !== undefined && Number(titulo.saldo_restante) > 0
      ? Number(titulo.saldo_restante)
      : Number(titulo.valor_total);
    setValor(saldo);
    const hoje = new Date().toISOString().slice(0, 10);
    setVencimento(titulo.data_vencimento && titulo.data_vencimento >= hoje ? titulo.data_vencimento : hoje);
    setCobranca(null);
    setError(null);
  }, [titulo, isOpen]);

  if (!titulo) return null;

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await emitirCobrancaAsaas({
      customerName: titulo.cliente_nome || 'Cliente TerraGest',
      customerCpfCnpj: cpfCnpj,
      customerPhone: telefone,
      billingType,
      value: valor,
      dueDate: vencimento,
      description: `Serviço / Medição ${titulo.numero_medicao} (${titulo.obra_nome || 'TerraGest'})`,
      externalReference: titulo.id
    });
    setLoading(false);
    if (res.ok && res.charge) {
      setCobranca(res.charge);
    } else {
      setError(res.error || 'Erro ao gerar cobrança no Asaas.');
    }
  };

  const copiarPix = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emitir Cobrança Bancária (Asaas Boleto + PIX)">
      <div className="space-y-4 text-left text-xs">
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-bold text-blue-950 text-sm">{titulo.cliente_nome}</p>
            <p className="text-[11px] text-blue-800">{titulo.obra_nome} • Ref: {titulo.numero_medicao}</p>
          </div>
          <span className="font-mono font-bold text-base text-blue-900">{formatBRL(valor)}</span>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        {!cobranca ? (
          <form onSubmit={handleGerar} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">CPF ou CNPJ do Cliente *</label>
                <input required value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder="Somente números" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">WhatsApp / Telefone (Notificação Asaas)</label>
                <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Ex: 99988887777" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Modalidade *</label>
                <select value={billingType} onChange={(e) => setBillingType(e.target.value as any)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold">
                  <option value="UNDEFINED">Boleto + PIX (Completo)</option>
                  <option value="PIX">Somente PIX QR Code</option>
                  <option value="BOLETO">Boleto Bancário + PIX</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Valor da Cobrança (R$) *</label>
                <input type="number" step="0.01" required value={valor} onChange={(e) => setValor(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Vencimento *</label>
                <input type="date" required value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-xl font-semibold cursor-pointer">Cancelar</button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Emitindo no Asaas...' : 'Gerar Boleto / PIX no Asaas'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <p className="font-bold text-emerald-900 text-sm">Cobrança registrada no Asaas com sucesso!</p>
            {cobranca.pixQrCodeBase64 && (
              <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                <img src={`data:image/png;base64,${cobranca.pixQrCodeBase64}`} alt="QR Code PIX Asaas" className="w-36 h-36 object-contain" />
                {cobranca.pixCopiaECola && (
                  <button type="button" onClick={() => copiarPix(cobranca.pixCopiaECola!)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer">
                    {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiado ? 'Código PIX Copiado!' : 'Copiar PIX Copia e Cola'}</span>
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {cobranca.invoiceUrl && (
                <a href={cobranca.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl font-bold">
                  <ExternalLink className="w-3.5 h-3.5" /><span>Abrir Fatura Completa Asaas</span>
                </a>
              )}
              {cobranca.bankSlipUrl && (
                <a href={cobranca.bankSlipUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 text-white rounded-xl font-bold">
                  <FileText className="w-3.5 h-3.5" /><span>Baixar PDF do Boleto</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
