import React from 'react';
import { Calendar, FileText, ReceiptText } from 'lucide-react';

interface MedicaoPagamentoTabProps {
  numeroMedicao: string;
  setNumeroMedicao: (val: string) => void;
  dataEmissao: string;
  setDataEmissao: (val: string) => void;
  dataVencimento: string;
  setDataVencimento: (val: string) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
}

export const MedicaoPagamentoTab: React.FC<MedicaoPagamentoTabProps> = ({
  numeroMedicao,
  setNumeroMedicao,
  dataEmissao,
  setDataEmissao,
  dataVencimento,
  setDataVencimento,
  observacoes,
  setObservacoes
}) => {
  return (
    <div className="space-y-4 text-xs text-left">
      <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
        <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
          <ReceiptText className="w-4 h-4 text-amber-600" />
          Condições de Cobrança e Vencimento
        </h4>
        <p className="text-[11px] text-amber-800">
          Informe o identificador da medição e as datas para acompanhamento financeiro de contas a receber e emissão da Nota Fiscal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Número da Medição / BM *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: MED-202609-001"
            value={numeroMedicao}
            onChange={(e) => setNumeroMedicao(e.target.value)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Data de Emissão *
          </label>
          <input
            type="date"
            required
            value={dataEmissao}
            onChange={(e) => setDataEmissao(e.target.value)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            Data de Vencimento *
          </label>
          <input
            type="date"
            required
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Observações / Cláusulas de Medição (Opcional)
        </label>
        <textarea
          rows={3}
          placeholder="Ex: Medição mensal de serviços de terraplanagem referente ao contrato n° 45/2026. NF e boleto faturados para 30 dias."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
        />
      </div>
    </div>
  );
};
