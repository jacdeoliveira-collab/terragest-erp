import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, DollarSign, Calendar, Building, Tag, Landmark } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useObras } from '../../../hooks/useObras';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import { EmprestimoFieldsBox } from '../../common/EmprestimoFieldsBox';
import { extrairInfoEmprestimo, formatarTagEmprestimo } from '../../../utils/emprestimoHelper';
import type { ContaPagarItem, CategoriaContaPagar, CreateContaPagarDTO } from '../../../types/contasPagar.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conta: ContaPagarItem | null;
  onSalvar: (id: string, dto: Partial<CreateContaPagarDTO>) => Promise<{ success: boolean; error?: string }>;
}

export const EditarContaPagarModal: React.FC<Props> = ({ isOpen, onClose, conta, onSalvar }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const { obras } = useObras();
  const { contas, contaPadrao } = useContasBancarias();
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState<CategoriaContaPagar>('PECAS_MANUTENCAO');
  const [valor, setValor] = useState<number>(0);
  const [dataVencimento, setDataVencimento] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [obraId, setObraId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [credorNome, setCredorNome] = useState('');
  const [dataEmp, setDataEmp] = useState(hoje);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conta) {
      const infoEmp = extrairInfoEmprestimo(conta);
      setDescricao(conta.descricao || '');
      setFornecedor(conta.fornecedor || '');
      setCategoria((conta.categoria as CategoriaContaPagar) || 'PECAS_MANUTENCAO');
      setValor(Number(conta.valor) || 0);
      setDataVencimento(conta.data_vencimento || '');
      setContaBancariaId(infoEmp.isEmprestimo ? 'EMPRESTIMO' : (conta.conta_bancaria_id || contaPadrao?.id || ''));
      setObraId(conta.obra_id || '');
      setObservacoes(infoEmp.observacaoLimpa || '');
      setCredorNome(infoEmp.credorNome || '');
      setDataEmp(infoEmp.dataEmprestimo || conta.data_vencimento || hoje);
      setError(null);
    }
  }, [conta, contaPadrao, hoje]);

  if (!conta) return null;

  const isEmp = contaBancariaId === 'EMPRESTIMO' || categoria === 'EMPRESTIMOS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const tagEmp = isEmp
      ? `${formatarTagEmprestimo({ credorNome: credorNome.trim() || fornecedor.trim(), dataEmprestimo: dataEmp, dataPagamentoPrevista: dataVencimento })} `
      : '';
    const res = await onSalvar(conta.id, {
      descricao, fornecedor, categoria, valor,
      data_vencimento: dataVencimento,
      forma_pagamento: isEmp ? 'EMPRESTIMO' : conta.forma_pagamento,
      conta_bancaria_id: isEmp ? undefined : (contaBancariaId || contaPadrao?.id || undefined),
      obra_id: obraId || undefined,
      observacoes: `${tagEmp}${observacoes}`.trim()
    });
    setIsSubmitting(false);
    if (res.success) onClose();
    else setError(res.error || 'Erro ao atualizar despesa.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Despesa / Origem / Empréstimo">
      <form onSubmit={handleSubmit} className="text-left space-y-3 text-xs">
        {error && (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5">Descrição *</label>
            <input type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5">Fornecedor / Credor *</label>
            <input type="text" required value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5 flex items-center gap-1"><Tag className="w-3 h-3 text-blue-600" /> Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaContaPagar)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="COMBUSTIVEL">Combustível / Diesel</option><option value="PECAS_MANUTENCAO">Peças, Óleo & Manutenção</option><option value="EMPRESTIMOS">💸 Empréstimos / Terceiros</option>
              <option value="LOCACAO_EQUIPAMENTOS">Locação de Máquinas</option><option value="FOLHA_RH">Folha / RH / Diárias</option><option value="ADMINISTRATIVO">Administrativo</option><option value="OUTROS">Outros</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-600" /> Valor (R$)</label>
            <input type="number" step="0.01" required min="0.01" value={valor} onChange={(e) => setValor(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-600" /> Quando Pagar (Venc.)</label>
            <input type="date" required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5 flex items-center gap-1"><Landmark className="w-3 h-3 text-emerald-600" /> De onde saiu o pagamento?</label>
            <select value={contaBancariaId} onChange={(e) => setContaBancariaId(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} {c.is_padrao ? '(Padrão)' : ''}</option>))}
              <option value="">💵 Dinheiro em Mãos / Caixa</option><option value="EMPRESTIMO">💸 Empréstimo (Pegou Emprestado)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-0.5 flex items-center gap-1"><Building className="w-3 h-3 text-emerald-600" /> Centro de Custo / Obra</label>
            <select value={obraId} onChange={(e) => setObraId(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="">Geral / Sede</option>{obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
            </select>
          </div>
        </div>

        {isEmp && (
          <EmprestimoFieldsBox compact credorNome={credorNome} setCredorNome={setCredorNome} dataEmprestimo={dataEmp} setDataEmprestimo={setDataEmp} dataPagamentoPrevista={dataVencimento} setDataPagamentoPrevista={setDataVencimento} />
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-0.5">Observações</label>
          <input type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting || !descricao || !fornecedor || valor <= 0} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer">
            <Check className="w-3.5 h-3.5" /><span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
