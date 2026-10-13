import React from 'react';
import { Building, FileText, DollarSign } from 'lucide-react';

interface Props {
  fornecedorNome: string;
  setFornecedorNome: (val: string) => void;
  numeroNf: string;
  setNumeroNf: (val: string) => void;
  valorTotal?: number;
  setValorTotal?: (val: number) => void;
  gerarContaPagar?: boolean;
  setGerarContaPagar?: (val: boolean) => void;
  tipoMovimentacao: 'ENTRADA' | 'SAIDA';
}

export const MovimentacaoFornecedorNfFields: React.FC<Props> = ({
  fornecedorNome, setFornecedorNome,
  numeroNf, setNumeroNf,
  valorTotal, setValorTotal,
  gerarContaPagar, setGerarContaPagar,
  tipoMovimentacao
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fornecedor / Fabricante</span>
          </label>
          <input
            placeholder="Ex: BAMAQ SA / Votorantim"
            value={fornecedorNome}
            onChange={(e) => setFornecedorNome(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Número NF-e / DANFE</span>
          </label>
          <input
            placeholder="Ex: NF-28438"
            value={numeroNf}
            onChange={(e) => setNumeroNf(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Valor Total da Nota (R$)</span>
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 2591.71"
            value={valorTotal || ''}
            onChange={(e) => setValorTotal?.(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-semibold focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {tipoMovimentacao === 'ENTRADA' && (valorTotal || 0) > 0 && setGerarContaPagar && (
        <label className="flex items-center gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(gerarContaPagar)}
            onChange={(e) => setGerarContaPagar(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded"
          />
          <span className="font-semibold">Gerar despesa no Contas a Pagar (R$ {Number(valorTotal).toFixed(2)})</span>
        </label>
      )}
    </>
  );
};
