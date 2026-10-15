import React, { useState } from 'react';
import { DollarSign, Calendar, CreditCard, Receipt, FileText } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import type { MedicaoItem } from '../../../types/faturamento.types';
import { gerarReciboPDF } from '../../../utils/reciboPdfGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titulo: MedicaoItem | null;
  onSalvarHaver: (id: string, valor: number, data: string, forma: string, obs?: string) => Promise<boolean>;
}

const formatBRL = (v: number) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const LancarHaverModal: React.FC<Props> = ({ isOpen, onClose, titulo, onSalvarHaver }) => {
  const saldoMax = titulo?.saldo_restante !== undefined ? Number(titulo.saldo_restante) : Number(titulo?.valor_total || 0);
  const [valor, setValor] = useState<number>(saldoMax > 0 ? saldoMax : 0);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState('PIX');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);

  React.useEffect(() => {
    if (titulo) {
      const s = titulo.saldo_restante !== undefined ? Number(titulo.saldo_restante) : Number(titulo.valor_total || 0);
      setValor(s > 0 ? s : Number(titulo.valor_total || 0));
    }
  }, [titulo]);

  if (!titulo) return null;

  const handleSalvar = async (emitirRecibo: boolean) => {
    if (!valor || valor <= 0) return;
    setSalvando(true);
    const ok = await onSalvarHaver(titulo.id, valor, data, forma, obs);
    setSalvando(false);
    if (ok) {
      if (emitirRecibo) {
        gerarReciboPDF({
          numeroRecibo: `HAV-${Date.now().toString(36).slice(-4).toUpperCase()}`,
          valor: Number(valor),
          clienteNome: titulo.cliente_nome || 'Cliente',
          clienteDocumento: titulo.cliente_documento,
          clienteTelefone: titulo.cliente_telefone,
          dataPagamento: data, formaPagamento: forma,
          referente: `Haver / Pagamento parcial ref. ao serviço ${titulo.numero_medicao} (${titulo.obra_nome})`,
          observacoes: obs || undefined
        });
      }
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Haver / Pagamento Parcial do Cliente">
      <div className="text-left space-y-3.5 text-xs">
        {/* Painel do Cliente e Saldo */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">{titulo.cliente_nome}</span>
            <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
              {titulo.numero_medicao}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-blue-200/80 font-mono text-[11px]">
            <div><span className="text-gray-500 block text-[9px] uppercase">Contrato Total</span><span className="font-bold text-gray-800">{formatBRL(Number(titulo.valor_total))}</span></div>
            <div><span className="text-emerald-600 block text-[9px] uppercase">Já Recebido</span><span className="font-bold text-emerald-700">{formatBRL(Number(titulo.valor_adiantamento || 0))}</span></div>
            <div><span className="text-blue-700 block text-[9px] uppercase">Saldo em Aberto</span><span className="font-bold text-blue-900">{formatBRL(saldoMax)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Valor do Haver (R$) *
            </label>
            <input
              type="number" step="0.01" min="0.01" max={saldoMax || undefined} value={valor || ''}
              onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Data do Pagamento *
            </label>
            <input
              type="date" value={data} onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Forma de Pagamento *
            </label>
            <select value={forma} onChange={(e) => setForma(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900">
              <option value="PIX">PIX</option>
              <option value="DINHEIRO">Dinheiro em Espécie</option>
              <option value="TRANSFERENCIA">Transferência / TED</option>
              <option value="CARTAO">Cartão</option>
              <option value="BOLETO">Boleto</option>
              <option value="CHEQUE">Cheque</option>
              <option value="DESCONTO">🏷️ Desconto / Abatimento Comercial</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" /> Referente / Observação
            </label>
            <input
              type="text" placeholder="Ex: 1º Haver no canteiro de obras" value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
            Cancelar
          </button>
          <button
            type="button" disabled={salvando || valor <= 0} onClick={() => handleSalvar(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs"
          >
            {salvando ? 'Salvando...' : 'Salvar Haver'}
          </button>
          <button
            type="button" disabled={salvando || valor <= 0} onClick={() => handleSalvar(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Salvar & Emitir Recibo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
