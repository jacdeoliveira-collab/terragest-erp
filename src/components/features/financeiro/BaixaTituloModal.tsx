import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Calendar, CreditCard, Landmark } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import type { MedicaoItem, FormaPagamentoTitulo } from '../../../types/faturamento.types';

interface BaixaTituloModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: MedicaoItem | null;
  onConfirmar: (id: string, dataPagamento: string, formaPagamento: FormaPagamentoTitulo, contaBancariaId?: string) => Promise<boolean>;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const BaixaTituloModal: React.FC<BaixaTituloModalProps> = ({
  isOpen,
  onClose,
  titulo,
  onConfirmar
}) => {
  const { contas } = useContasBancarias();
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoTitulo>('PIX');
  const [contaBancariaId, setContaBancariaId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!titulo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const success = await onConfirmar(titulo.id, dataPagamento, formaPagamento, contaBancariaId || undefined);
    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError('Falha ao confirmar recebimento do título.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liquidação de Título / Baixa de Recebimento">
      <form onSubmit={handleSubmit} className="text-left space-y-4 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumo do Título */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-emerald-900 text-sm">{titulo.numero_medicao}</span>
            <span className="text-emerald-700 font-bold font-mono text-sm">{formatBRL(Number(titulo.valor_total))}</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            <b>Obra:</b> {titulo.obra_nome} | <b>Cliente:</b> {titulo.cliente_nome}
          </p>
          <p className="text-[10px] text-emerald-700">
            Competência: {titulo.competencia} | Vencimento original: {new Date(titulo.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Data do Pagamento *
            </label>
            <input
              type="date"
              required
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Forma de Liquidação *
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value as FormaPagamentoTitulo)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PIX">PIX Instantâneo</option>
              <option value="BOLETO">Boleto Bancário</option>
              <option value="TED">TED / Transferência</option>
              <option value="TRANSFERENCIA">Transferência entre Contas</option>
              <option value="DINHEIRO">Dinheiro / Espécie</option>
              <option value="OUTRO">Outra Forma</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              Conta / Caixa de Destino
            </label>
            <select
              value={contaBancariaId}
              onChange={(e) => setContaBancariaId(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione a conta</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome_conta} ({c.banco})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Recebimento'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
