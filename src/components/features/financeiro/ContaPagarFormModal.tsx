import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, DollarSign, Calendar, Building, Tag, Landmark, CreditCard } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useObras } from '../../../hooks/useObras';
import { useFormaContaSync } from '../../../hooks/useFormaContaSync';
import { EmprestimoFieldsBox } from '../../common/EmprestimoFieldsBox';
import { formatarTagEmprestimo } from '../../../utils/emprestimoHelper';
import type { CategoriaContaPagar, CreateContaPagarDTO, FormaPagamentoDespesa } from '../../../types/contasPagar.types';

interface ContaPagarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dto: CreateContaPagarDTO) => Promise<{ success: boolean; error?: string }>;
  defaultEmprestimo?: boolean;
}

export const ContaPagarFormModal: React.FC<ContaPagarFormModalProps> = ({
  isOpen, onClose, onSalvar, defaultEmprestimo = false
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const { obras } = useObras();
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState<CategoriaContaPagar>(defaultEmprestimo ? 'EMPRESTIMOS' : 'PECAS_MANUTENCAO');
  const [valor, setValor] = useState<number>(0);
  const [dataVencimento, setDataVencimento] = useState(hoje);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa>(defaultEmprestimo ? 'EMPRESTIMO' : 'PIX');
  const [contaBancariaId, setContaBancariaId] = useState(defaultEmprestimo ? 'EMPRESTIMO' : '');
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaBancariaId, setFormaPagamento, setContaBancariaId);
  const [credorNome, setCredorNome] = useState('');
  const [dataEmp, setDataEmp] = useState(hoje);
  const [obraId, setObraId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmp = formaPagamento === 'EMPRESTIMO' || categoria === 'EMPRESTIMOS' || contaBancariaId === 'EMPRESTIMO';

  useEffect(() => {
    if (defaultEmprestimo) { setCategoria('EMPRESTIMOS'); setFormaPagamento('EMPRESTIMO'); setContaBancariaId('EMPRESTIMO'); }
    else if (!contaBancariaId && contaPadrao) setContaBancariaId(contaPadrao.id);
  }, [defaultEmprestimo, contaPadrao, contaBancariaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmp && !credorNome.trim() && !fornecedor.trim()) {
      setError('Informe de quem pegou o valor emprestado.'); return;
    }
    setError(null); setIsSubmitting(true);
    const credorFinal = credorNome.trim() || fornecedor.trim();
    const tagEmp = isEmp ? `${formatarTagEmprestimo({ credorNome: credorFinal, dataEmprestimo: dataEmp, dataPagamentoPrevista: dataVencimento })} ` : '';
    const fornFinal = isEmp && fornecedor.trim() && credorNome.trim() && credorNome.trim() !== fornecedor.trim()
      ? `${credorNome.trim()} (${fornecedor.trim()})`
      : (credorFinal || fornecedor.trim());

    const res = await onSalvar({
      descricao, fornecedor: fornFinal, categoria, valor, data_vencimento: dataVencimento,
      forma_pagamento: isEmp ? 'EMPRESTIMO' : formaPagamento,
      conta_bancaria_id: isEmp ? undefined : (contaBancariaId || contaPadrao?.id || undefined),
      obra_id: obraId || undefined, observacoes: `${tagEmp}${observacoes}`.trim()
    });
    setIsSubmitting(false);
    if (res.success) { setDescricao(''); setFornecedor(''); setCredorNome(''); setValor(0); setObservacoes(''); onClose(); }
    else setError(res.error || 'Erro ao registrar despesa.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultEmprestimo ? 'Registrar Novo Empréstimo / Recurso Tomado' : 'Lançar Conta a Pagar / Despesa'}>
      <form onSubmit={handleSubmit} className="text-left space-y-3 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descrição (Combustível, Óleo, Peça ou Finalidade) *</label>
            <input type="text" required placeholder="Ex: Compra de Diesel / Óleo 15W40 / Peça" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Fornecedor / Onde Comprou *</label>
            <input type="text" required placeholder="Ex: Posto Alvorada / Auto Peças / Credor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-blue-600" /> Categoria *</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaContaPagar)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="COMBUSTIVEL">Combustível / Diesel</option><option value="PECAS_MANUTENCAO">Peças, Óleo & Manutenção</option><option value="EMPRESTIMOS">💸 Empréstimos / Terceiros</option>
              <option value="LOCACAO_EQUIPAMENTOS">Locação de Equipamentos</option><option value="FOLHA_RH">Folha / RH / Diárias</option><option value="ADMINISTRATIVO">Administrativo & Sede</option><option value="OUTROS">Outros Passivos</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Valor (R$) *</label>
            <input type="number" step="0.01" required min="0.01" value={valor || ''} onChange={(e) => setValor(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-600" /> Quando Pagar (Vencimento) *</label>
            <input type="date" required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> De onde saiu o pagamento?</label>
            <select value={contaBancariaId} onChange={(e) => onContaChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} {c.is_padrao ? '(Padrão)' : ''}</option>))}
              <option value="">💵 Dinheiro em Mãos / Caixa</option>
              <option value="EMPRESTIMO">💸 Empréstimo (Pegou Emprestado)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-blue-600" /> Forma Pagamento</label>
            <select value={formaPagamento} onChange={(e) => onFormaChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="PIX">PIX Bancário</option><option value="DINHEIRO">Dinheiro em Mãos</option><option value="EMPRESTIMO">💸 Empréstimo (Terceiro)</option><option value="BOLETO">Boleto</option><option value="TED">TED / Transferência</option><option value="CARTAO">Cartão</option><option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Building className="w-3.5 h-3.5 text-gray-500" /> Centro de Custo</label>
            <select value={obraId} onChange={(e) => setObraId(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="">Geral / Sede</option>
              {obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
            </select>
          </div>
        </div>

        {isEmp && (
          <EmprestimoFieldsBox compact credorNome={credorNome} setCredorNome={setCredorNome} dataEmprestimo={dataEmp} setDataEmprestimo={setDataEmp} dataPagamentoPrevista={dataVencimento} setDataPagamentoPrevista={setDataVencimento} />
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Observações (Opcional)</label>
          <input type="text" placeholder="Ex: NF-e 12345 / Condições combinadas" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting || !descricao || !fornecedor || valor <= 0} className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer">
            <Check className="w-4 h-4" /><span>{isSubmitting ? 'Salvando...' : 'Salvar Registro'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
