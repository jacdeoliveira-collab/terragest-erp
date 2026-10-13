import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CombustivelCardItemProps {
  titulo: string;
  icon: LucideIcon;
  litros: number;
  onChangeLitros: (v: number) => void;
  valor: number;
  onChangeValor: (v: number) => void;
  placeholderLitros: string;
  placeholderValor: string;
  containerClass: string;
  headerTextClass: string;
  iconClass: string;
}

export const CombustivelCardItem: React.FC<CombustivelCardItemProps> = ({
  titulo, icon: Icon, litros, onChangeLitros, valor, onChangeValor,
  placeholderLitros, placeholderValor, containerClass, headerTextClass, iconClass
}) => {
  return (
    <div className={`p-3 rounded-xl space-y-2 border ${containerClass}`}>
      <span className={`font-bold flex items-center gap-1.5 text-xs ${headerTextClass}`}>
        <Icon className={`w-4 h-4 ${iconClass}`} />
        {titulo}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-gray-700 mb-1 font-semibold">Litros (L)</label>
          <input
            type="number"
            step="0.01"
            value={litros || ''}
            onChange={(e) => onChangeLitros(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-mono font-bold"
            placeholder={placeholderLitros}
          />
        </div>
        <div>
          <label className="block text-[11px] text-gray-700 mb-1 font-semibold">Valor Total (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valor || ''}
            onChange={(e) => onChangeValor(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-rose-700"
            placeholder={placeholderValor}
          />
        </div>
      </div>
    </div>
  );
};
