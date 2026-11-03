import React from 'react';
import { DollarSign, Calendar, CreditCard, Landmark, FileText, Printer, User } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { useLancarValeFormState } from './useLancarValeFormState';
import type { Funcionario } from '../../../../types/rh.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  funcionarioInicial?: Funcionario | null;
  onSuccess?: () => void;
}

export const LancarValeModal: React.FC<Props> = ({ isOpen, onClose, funcionarioInicial, onSuccess }) => {
  const {
    colaboradores, colaboradorId, setColaboradorId, setColaboradorNome,
    valor, setValor, data, setData, forma, onFormaChange,
    contaId, onContaChange, contas, motivo, setMotivo,
    salvando, erro, handleSalvar
  } = useLancarValeFormState(funcionarioInicial, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Haver / Vale de Colaborador (RH)" maxWidth="md">
      <div className="space-y-3.5 text-xs text-left">
        {erro && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{erro}</div>}

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-emerald-600" /> Colaborador / Operador *
          </label>
          <select
            value={colaboradorId}
            onChange={(e) => {
              setColaboradorId(e.target.value);
              const found = colaboradores.find((c) => c.id === e.target.value);
              if (found) setColaboradorNome(found.nome);
            }}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
          >
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>{c.nome} ({c.cargo.replace('_', ' ')})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Valor do Vale (R$) *
            </label>
            <input
              type="number" step="0.01" min="0.01" value={valor}
              onChange={(e) => setValor(e.target.value)} placeholder="0.00"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-sm font-bold text-emerald-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data do Pagamento *
            </label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono text-gray-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Forma de Pagamento *
            </label>
            <select value={forma} onChange={(e) => onFormaChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900">
              <option value="Dinheiro">Dinheiro (Em mãos)</option>
              <option value="PIX">PIX</option>
              <option value="Transferência">Transferência / TED</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Caixa / Conta de Saída
            </label>
            <select value={contaId} onChange={(e) => onContaChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900">
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome_conta}</option>)}
              {contas.length === 0 && <option value="">Caixa Geral</option>}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-gray-500" /> Motivo / Observação
          </label>
          <input
            type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: Adiantamento semanal, despesa em campo ou haver direto"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="button" disabled={salvando} onClick={() => handleSalvar(false)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">
            {salvando ? 'Gravando...' : 'Salvar Vale'}
          </button>
          <button type="button" disabled={salvando} onClick={() => handleSalvar(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer">
            <Printer className="w-3.5 h-3.5" /><span>Salvar & Emitir Recibo PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
