import React, { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { registrarPagamentoOperador } from '../../../../services/quitarOperadorService';
import type { FuncionarioRemuneracaoItem } from '../../../../types/funcionarioHistorico.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: FuncionarioRemuneracaoItem | null;
  operadorNome: string;
  onSuccess: () => void;
}

export const QuitarOperadorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  item,
  operadorNome,
  onSuccess
}) => {
  if (!item) return null;

  const [valorPago, setValorPago] = useState<number>(item.saldoRestante > 0 ? item.saldoRestante : item.totalGanho);
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formaPagamento, setFormaPagamento] = useState<string>('PIX');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      setErro(null);
      await registrarPagamentoOperador({
        servicoId: item.servicoId,
        valorPago: Number(valorPago),
        totalGanho: item.totalGanho,
        dataPagamento,
        formaPagamento,
        operadorNome
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pagamento do Operador: ${operadorNome}`} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Cliente / Serviço:</span>
            <span className="font-semibold text-gray-900">{item.clienteNome}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Máquina:</span>
            <span className="font-semibold text-gray-900">{item.maquinaNome} ({item.horasTrabalhadas}h)</span>
          </div>
          <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-1">
            <span>Total Ganho pelo Operador:</span>
            <span className="font-bold text-gray-900 font-mono">R$ {item.totalGanho.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>Já Pago / Adiantado:</span>
            <span className="font-bold font-mono">R$ {item.valorAdiantado.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-amber-800 font-bold border-t border-gray-200 pt-1">
            <span>Saldo a Quitar:</span>
            <span className="font-mono text-sm">R$ {item.saldoRestante.toFixed(2)}</span>
          </div>
        </div>

        {erro && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Valor Pago / Baixa (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={valorPago}
              onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Data Pagamento</label>
              <input
                type="date"
                required
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
              >
                <option value="PIX">PIX</option>
                <option value="TRANSFERENCIA">Transferência</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{salvando ? 'Salvando...' : 'Confirmar & Atualizar Contas a Pagar'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
