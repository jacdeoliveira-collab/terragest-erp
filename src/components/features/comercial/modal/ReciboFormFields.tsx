import React, { useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { useFormaContaSync } from '../../../../hooks/useFormaContaSync';

interface Props {
  valor: number;
  setValor: (v: number) => void;
  formaPagamento: string;
  setFormaPagamento: (v: string) => void;
  contaBancariaId: string;
  setContaBancariaId: (v: string) => void;
  dataPagamento: string;
  setDataPagamento: (v: string) => void;
  referente: string;
  setReferente: (v: string) => void;
  observacoes: string;
  setObservacoes: (v: string) => void;
}

export const ReciboFormFields: React.FC<Props> = ({
  valor, setValor,
  formaPagamento, setFormaPagamento,
  contaBancariaId, setContaBancariaId,
  dataPagamento, setDataPagamento,
  referente, setReferente,
  observacoes, setObservacoes
}) => {
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaBancariaId, setFormaPagamento, setContaBancariaId, 'Dinheiro em Espécie');

  useEffect(() => {
    if (!contaBancariaId && contaPadrao?.id) setContaBancariaId(contaPadrao.id);
  }, [contaPadrao, contaBancariaId, setContaBancariaId]);

  return (
    <div className="p-4 space-y-3 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Valor do Sinal / Adiantamento (R$)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">R$</span>
            <input
              type="number" step="0.01" min="0" placeholder="0.00"
              value={valor || ''} onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Forma de Pagamento</label>
          <select
            value={formaPagamento} onChange={(e) => onFormaChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="PIX">PIX (Chave / Transferência Imediata)</option>
            <option value="Transferência Bancária / TED">Transferência Bancária (TED/DOC)</option>
            <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
            <option value="Cheque">Cheque</option>
            <option value="Cartão de Crédito / Débito">Cartão</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1 flex items-center gap-1">
            <Landmark className="w-3 h-3 text-emerald-600" />
            <span>Banco / Caixa de Entrada</span>
          </label>
          <select
            value={contaBancariaId}
            onChange={(e) => onContaChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            {contas.length === 0 && <option value="">Caixa Geral da Empresa</option>}
            {contas.map((c) => <option key={c.id} value={c.id}>{c.nome_conta} ({c.banco})</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Data do Pagamento</label>
          <input
            type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Referente a (Descrição)</label>
        <textarea
          rows={2} value={referente} onChange={(e) => setReferente(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Observações Adicionais (Opcional)</label>
        <input
          type="text" placeholder="Ex: Pago via chave PIX..."
          value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
