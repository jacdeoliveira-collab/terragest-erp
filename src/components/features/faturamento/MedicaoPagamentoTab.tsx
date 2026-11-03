import React, { useEffect } from 'react';
import { Calendar, FileText, ReceiptText, CreditCard, Landmark } from 'lucide-react';
import { useFormaContaSync } from '../../../hooks/useFormaContaSync';

interface MedicaoPagamentoTabProps {
  numeroMedicao: string;
  setNumeroMedicao: (val: string) => void;
  dataEmissao: string;
  setDataEmissao: (val: string) => void;
  dataVencimento: string;
  setDataVencimento: (val: string) => void;
  formaPagamento: string;
  setFormaPagamento: (val: string) => void;
  contaBancariaId: string;
  setContaBancariaId: (val: string) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
}

export const MedicaoPagamentoTab: React.FC<MedicaoPagamentoTabProps> = ({
  numeroMedicao, setNumeroMedicao,
  dataEmissao, setDataEmissao,
  dataVencimento, setDataVencimento,
  formaPagamento, setFormaPagamento,
  contaBancariaId, setContaBancariaId,
  observacoes, setObservacoes
}) => {
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaBancariaId, setFormaPagamento, setContaBancariaId);

  useEffect(() => {
    if (!contaBancariaId && contaPadrao) {
      setContaBancariaId(contaPadrao.id);
    }
  }, [contaPadrao, contaBancariaId, setContaBancariaId]);

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
        <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
          <ReceiptText className="w-4 h-4 text-amber-600" />
          Condições de Cobrança, Banco de Entrada e Vencimento
        </h4>
        <p className="text-[11px] text-amber-800">
          O banco padrão já está selecionado para conciliação no Contas a Receber e emissão de Boleto/PIX.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" /> Número da Medição / BM *
          </label>
          <input type="text" required placeholder="Ex: MED-202609-001" value={numeroMedicao} onChange={(e) => setNumeroMedicao(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data de Emissão *
          </label>
          <input type="date" required value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Data de Vencimento *
          </label>
          <input type="date" required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Forma de Recebimento
          </label>
          <select value={formaPagamento} onChange={(e) => onFormaChange(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900">
            <option value="PIX">PIX Bancário</option>
            <option value="BOLETO">Boleto Bancário</option>
            <option value="TED">TED / Transferência</option>
            <option value="DINHEIRO">Dinheiro / Espécie</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Banco / Conta de Entrada (Onde Entra)
          </label>
          <select value={contaBancariaId} onChange={(e) => onContaChange(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900">
            {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} {c.is_padrao ? '(Padrão)' : ''}</option>))}
            {contas.length === 0 && <option value="">Caixa Geral da Empresa</option>}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Observações / Cláusulas de Medição (Opcional)</label>
        <textarea rows={2} placeholder="Ex: Medição mensal de serviços de terraplanagem. NF e boleto faturados para 30 dias." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900" />
      </div>
    </div>
  );
};
