import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Calendar, CreditCard, Landmark, Zap } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import { realizarTransferenciaPixAsaas } from '../../../services/asaasFinanceiroService';
import type { ContaPagarItem, FormaPagamentoDespesa } from '../../../types/contasPagar.types';

interface BaixaContaPagarModalProps {
  isOpen: boolean;
  onClose: () => void;
  conta: ContaPagarItem | null;
  onConfirmar: (
    id: string,
    dataPagamento: string,
    formaPagamento: FormaPagamentoDespesa,
    contaBancariaId?: string
  ) => Promise<{ success: boolean; error?: string } | boolean>;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const BaixaContaPagarModal: React.FC<BaixaContaPagarModalProps> = ({
  isOpen, onClose, conta, onConfirmar
}) => {
  const { contas } = useContasBancarias();
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa>('PIX');
  const [contaBancariaId, setContaBancariaId] = useState<string>('');
  const [enviarPixAsaas, setEnviarPixAsaas] = useState(false);
  const [chavePixAsaas, setChavePixAsaas] = useState(conta?.chave_pix_fornecedor || '');
  const [tipoChaveAsaas, setTipoChaveAsaas] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'>('CNPJ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!conta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (enviarPixAsaas && formaPagamento === 'PIX') {
      const chaveFinal = chavePixAsaas.trim() || conta.chave_pix_fornecedor?.trim() || '';
      if (!chaveFinal) {
        setError('Informe a chave PIX do favorecido para transferir pelo Asaas.');
        setIsSubmitting(false);
        return;
      }
      const pixRes = await realizarTransferenciaPixAsaas({
        value: Number(conta.valor),
        pixAddressKey: chaveFinal,
        pixAddressKeyType: tipoChaveAsaas,
        description: `${conta.descricao} (${conta.fornecedor})`.slice(0, 80)
      });
      if (!pixRes.ok) {
        setError(`Asaas: ${pixRes.error}`);
        setIsSubmitting(false);
        return;
      }
    }

    const res = await onConfirmar(conta.id, dataPagamento, formaPagamento, contaBancariaId || undefined);
    setIsSubmitting(false);

    const isOk = typeof res === 'boolean' ? res : res.success;
    if (isOk) onClose();
    else setError(typeof res === 'object' && res.error ? res.error : 'Falha ao confirmar liquidação.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liquidação de Despesa / Baixa de Pagamento">
      <form onSubmit={handleSubmit} className="text-left space-y-3.5 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">{conta.descricao}</span>
            <span className="text-rose-700 font-bold font-mono text-sm">{formatBRL(Number(conta.valor))}</span>
          </div>
          <p className="text-[11px] text-gray-700"><b>Favorecido:</b> {conta.fornecedor} | <b>Centro de Custo:</b> {conta.obra_nome}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Data do Pagamento *
            </label>
            <input type="date" required value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Forma de Liquidação *
            </label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as FormaPagamentoDespesa)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900">
              <option value="PIX">PIX Bancário</option>
              <option value="BOLETO">Boleto / Compensação</option>
              <option value="TED">TED / Transferência</option>
              <option value="CARTAO">Cartão Corporativo</option>
              <option value="DINHEIRO">Dinheiro / Espécie</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Conta / Caixa de Saída
            </label>
            <select value={contaBancariaId} onChange={(e) => setContaBancariaId(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900">
              <option value="">Selecione a conta</option>
              {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} ({c.banco})</option>))}
            </select>
          </div>
        </div>

        {formaPagamento === 'PIX' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
            <label className="flex items-center gap-2 font-bold text-blue-950 cursor-pointer">
              <input type="checkbox" checked={enviarPixAsaas} onChange={(e) => setEnviarPixAsaas(e.target.checked)} className="rounded text-blue-600" />
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Disparar Transferência PIX agora pela Conta Digital ASAAS</span>
            </label>
            {enviarPixAsaas && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <select value={tipoChaveAsaas} onChange={(e) => setTipoChaveAsaas(e.target.value as any)} className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg font-semibold">
                  <option value="CNPJ">Chave CNPJ</option>
                  <option value="CPF">Chave CPF</option>
                  <option value="PHONE">Celular / Telefone</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="EVP">Chave Aleatória</option>
                </select>
                <input required placeholder="Digite a chave PIX do favorecido..." value={chavePixAsaas} onChange={(e) => setChavePixAsaas(e.target.value)} className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg font-mono" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Processando...' : enviarPixAsaas ? 'Transferir PIX Asaas & Baixar' : 'Confirmar Pagamento'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
