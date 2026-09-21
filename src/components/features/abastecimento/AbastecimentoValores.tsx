import React from 'react';
import type { TipoCombustivel } from '../../../types/abastecimento.types';

interface AbastecimentoValoresProps {
  tipoCombustivel: TipoCombustivel;
  setTipoCombustivel: (val: TipoCombustivel) => void;
  litros: number;
  setLitros: (val: number) => void;
  valorTotal: number;
  setValorTotal: (val: number) => void;
}

export const AbastecimentoValores: React.FC<AbastecimentoValoresProps> = ({
  tipoCombustivel,
  setTipoCombustivel,
  litros,
  setLitros,
  valorTotal,
  setValorTotal
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Combustível *</label>
        <select
          value={tipoCombustivel}
          onChange={(e) => setTipoCombustivel(e.target.value as TipoCombustivel)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="DIESEL_S10">Diesel S10 (Linha Amarela Moderna)</option>
          <option value="DIESEL_S500">Diesel S500 (Tratores Convencionais)</option>
          <option value="GASOLINA">Gasolina Comum (Apoio)</option>
          <option value="ETANOL">Etanol Hidratado</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Volume (Litros) *</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            required
            value={litros}
            onChange={(e) => setLitros(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Valor Total (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={valorTotal}
            onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900"
          />
        </div>
      </div>
    </div>
  );
};
