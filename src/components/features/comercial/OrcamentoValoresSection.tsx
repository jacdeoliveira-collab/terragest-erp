import React from 'react';
import { Tag } from 'lucide-react';

interface OrcamentoValoresSectionProps {
  valorHora: number;
  setValorHora: (v: number) => void;
  horasEstimadas: number;
  setHorasEstimadas: (v: number) => void;
  valorDesconto: number;
  setValorDesconto: (v: number) => void;
  validadeDias: number;
  setValidadeDias: (v: number) => void;
}

export const OrcamentoValoresSection: React.FC<OrcamentoValoresSectionProps> = ({
  valorHora,
  setValorHora,
  horasEstimadas,
  setHorasEstimadas,
  valorDesconto,
  setValorDesconto,
  validadeDias,
  setValidadeDias
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Valor da Hora *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={valorHora}
          onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Horas Estimadas *</label>
        <input
          type="number"
          step="0.5"
          min="1"
          required
          value={horasEstimadas}
          onChange={(e) => setHorasEstimadas(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
        />
      </div>

      <div>
        <label className="block font-semibold text-amber-700 mb-1 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Desconto (R$)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valorDesconto || ''}
          placeholder="0.00"
          onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 bg-amber-50/50 border border-amber-300 rounded-xl font-mono text-amber-800 text-xs"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Validade (Dias)</label>
        <input
          type="number"
          min="1"
          value={validadeDias}
          onChange={(e) => setValidadeDias(parseInt(e.target.value) || 15)}
          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
        />
      </div>
    </div>
  );
};
