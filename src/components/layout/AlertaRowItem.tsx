import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Wrench,
  DollarSign,
  TrendingUp,
  HardHat,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import type { AlertaItem } from '../../types/alertaCentral.types';

interface AlertaRowItemProps {
  alerta: AlertaItem;
  onSelect: () => void;
}

export const AlertaRowItem: React.FC<AlertaRowItemProps> = ({ alerta, onSelect }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onSelect();
    navigate(alerta.rota);
  };

  const getIcon = () => {
    if (alerta.modulo === 'FINANCEIRO_PAGAR') return DollarSign;
    if (alerta.modulo === 'FINANCEIRO_RECEBER') return TrendingUp;
    if (alerta.modulo === 'MANUTENCAO') return Wrench;
    if (alerta.modulo === 'RH') return HardHat;
    if (alerta.modulo === 'CHECKLIST') return ClipboardCheck;
    return AlertTriangle;
  };

  const Icon = getIcon();
  const isCritico = alerta.nivel === 'CRITICO';

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-2.5 flex items-start gap-2.5 hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group"
    >
      <div
        className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${
          isCritico
            ? 'bg-rose-50 text-rose-600 border-rose-200'
            : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-0.5">
          <span className="text-[11px] font-bold text-gray-800 truncate group-hover:text-emerald-700">
            {alerta.titulo}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold shrink-0 uppercase tracking-wider ${
              isCritico ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {alerta.tagModulo}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {alerta.descricao}
        </p>

        {alerta.valorFormatado && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-gray-900">
            <span className="text-gray-400 font-normal">Valor:</span> {alerta.valorFormatado}
          </div>
        )}
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-600 shrink-0 self-center transition-colors" />
    </button>
  );
};
