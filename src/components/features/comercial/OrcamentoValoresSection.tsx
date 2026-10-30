import React from 'react';
import { Tag, Truck, PauseCircle, CalendarClock } from 'lucide-react';

interface OrcamentoValoresSectionProps {
  valorMobilizacao: number;
  setValorMobilizacao: (v: number) => void;
  valorHoraParada: number;
  setValorHoraParada: (v: number) => void;
  valorDesconto: number;
  setValorDesconto: (v: number) => void;
  validadeDias: number;
  setValidadeDias: (v: number) => void;
}

export const OrcamentoValoresSection: React.FC<OrcamentoValoresSectionProps> = ({
  valorMobilizacao,
  setValorMobilizacao,
  valorHoraParada,
  setValorHoraParada,
  valorDesconto,
  setValorDesconto,
  validadeDias,
  setValidadeDias
}) => {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 text-xs text-left">
      <div className="font-bold text-gray-800 border-b border-gray-100 pb-1.5">
        Custos Logísticos, Hora Parada & Desconto Comercial
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div>
          <label className="block font-semibold text-blue-800 mb-1 flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600" /> Mobilização / Prancha (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00 (Ida e Volta)"
            value={valorMobilizacao || ''}
            onChange={(e) => setValorMobilizacao(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-blue-50/40 border border-blue-200 rounded-lg font-mono text-blue-900 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <PauseCircle className="w-3 h-3 text-slate-500" /> Hora Parada / Chuva (R$/h)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 150.00"
            value={valorHoraParada || ''}
            onChange={(e) => setValorHoraParada(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Desconto Comercial (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valorDesconto || ''}
            placeholder="0.00"
            onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-amber-50/50 border border-amber-300 rounded-lg font-mono text-amber-800 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CalendarClock className="w-3 h-3 text-emerald-600" /> Validade Proposta (Dias)
          </label>
          <input
            type="number"
            min="1"
            value={validadeDias}
            onChange={(e) => setValidadeDias(parseInt(e.target.value) || 15)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
};
