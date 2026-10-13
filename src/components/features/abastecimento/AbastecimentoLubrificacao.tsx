import React from 'react';
import { Droplet } from 'lucide-react';

interface AbastecimentoLubrificacaoProps {
  qtdOleo: number;
  setQtdOleo: (val: number) => void;
  qtdGraxa: number;
  setQtdGraxa: (val: number) => void;
}

export const AbastecimentoLubrificacao: React.FC<AbastecimentoLubrificacaoProps> = ({
  qtdOleo,
  setQtdOleo,
  qtdGraxa,
  setQtdGraxa
}) => {
  return (
    <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-xl space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
        <Droplet className="w-3.5 h-3.5 text-amber-700" />
        <span>Lubrificação em Campo (Opcional)</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Óleo Lubrificante (Litros)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={qtdOleo || ''}
            placeholder="0.0"
            onChange={(e) => setQtdOleo(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Graxa (Kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={qtdGraxa || ''}
            placeholder="0.0"
            onChange={(e) => setQtdGraxa(parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
