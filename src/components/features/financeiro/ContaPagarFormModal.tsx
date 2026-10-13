import React, { useState } from 'react';
import { AlertCircle, Check, DollarSign, Calendar, Building, Tag } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useObras } from '../../../hooks/useObras';
import type { CategoriaContaPagar, CreateContaPagarDTO } from '../../../types/contasPagar.types';

interface ContaPagarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dto: CreateContaPagarDTO) => Promise<{ success: boolean; error?: string }>;
}

export const ContaPagarFormModal: React.FC<ContaPagarFormModalProps> = ({ isOpen, onClose, onSalvar }) => {
  const { obras } = useObras();
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState<CategoriaContaPagar>('PECAS_MANUTENCAO');
  const [valor, setValor] = useState<number>(0);
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().slice(0, 10));
  const [obraId, setObraId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await onSalvar({ descricao, fornecedor, categoria, valor, data_vencimento: dataVencimento, obra_id: obraId || undefined, observacoes });
    setIsSubmitting(false);
    if (res.success) {
      setDescricao(''); setFornecedor(''); setValor(0); setObservacoes('');
      onClose();
    } else {
      setError(res.error || 'Erro ao registrar despesa.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Conta a Pagar / Despesa">
      <form onSubmit={handleSubmit} className="text-left space-y-3.5 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descrição da Despesa *</label>
            <input type="text" required placeholder="Ex: Filtros e Óleo 15W40" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Fornecedor / Favorecido *</label>
            <input type="text" required placeholder="Ex: Distribuidora de Peças Ltda" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-blue-600" /> Categoria *</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaContaPagar)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="COMBUSTIVEL">Combustível / Diesel</option>
              <option value="PECAS_MANUTENCAO">Peças & Manutenção</option>
              <option value="LOCACAO_EQUIPAMENTOS">Locação de Equipamentos</option>
              <option value="FOLHA_RH">Folha / RH / Encargos</option>
              <option value="ADMINISTRATIVO">Administrativo & Sede</option>
              <option value="OUTROS">Outros Passivos</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Valor (R$) *</label>
            <input type="number" step="0.01" required min="0.01" value={valor} onChange={(e) => setValor(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-600" /> Vencimento *</label>
            <input type="date" required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Building className="w-3.5 h-3.5 text-gray-500" /> Obra / Centro de Custo (Opcional)</label>
          <select value={obraId} onChange={(e) => setObraId(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
            <option value="">Geral / Despesa Administrativa</option>
            {obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Observações (Opcional)</label>
          <input type="text" placeholder="Ex: NF-e 12345 / Boleto com chave de acesso" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting || !descricao || !fornecedor || valor <= 0} className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer">
            <Check className="w-4 h-4" /><span>{isSubmitting ? 'Salvando...' : 'Salvar Conta a Pagar'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
