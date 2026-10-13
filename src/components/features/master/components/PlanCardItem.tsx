import React from 'react';
import { Check } from 'lucide-react';
import type { TipoPlanoTenant } from '../../../../types/tenant.types';

interface PlanCardProps {
  id: TipoPlanoTenant;
  nome: string;
  preco: string;
  subtitulo: string;
  recursos: string[];
  isAtual: boolean;
  onSelect: (plano: TipoPlanoTenant) => void;
}

export const PlanCardItem: React.FC<PlanCardProps> = ({
  id,
  nome,
  preco,
  subtitulo,
  recursos,
  isAtual,
  onSelect,
}) => {
  return (
    <div
      className={`relative bg-[#0d1117] rounded-xl p-4 flex flex-col justify-between border transition-all ${
        isAtual
          ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
          : 'border-[#21262d] hover:border-[#30363d]'
      }`}
    >
      {isAtual && (
        <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-black rounded-full shadow-sm">
          Plano Vigente
        </span>
      )}

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white">{nome}</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitulo}</p>
        </div>

        <div className="text-xl font-black font-mono text-emerald-400">
          {preco}
        </div>

        <ul className="space-y-1.5 pt-2 border-t border-[#21262d]">
          {recursos.map((rec, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300">
              <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 mt-auto">
        <button
          onClick={() => onSelect(id)}
          disabled={isAtual}
          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
            isAtual
              ? 'bg-[#161b22] text-gray-400 border border-[#21262d] cursor-default'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
          }`}
        >
          {isAtual ? 'Plano Atual' : 'Aplicar Este Plano'}
        </button>
      </div>
    </div>
  );
};
