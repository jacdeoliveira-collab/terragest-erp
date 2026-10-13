import React from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';

interface ContasPagarKpiCardsProps {
  totalAPagarAberto: number;
  totalPagoMes: number;
  filtroCard: 'TODOS' | 'PENDENTE' | 'PAGO';
  onToggleFiltro: (filtro: 'PENDENTE' | 'PAGO') => void;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ContasPagarKpiCards: React.FC<ContasPagarKpiCardsProps> = ({
  totalAPagarAberto,
  totalPagoMes,
  filtroCard,
  onToggleFiltro
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
      <button
        type="button"
        onClick={() => onToggleFiltro('PENDENTE')}
        title="Clique para filtrar apenas os passivos pendentes de liquidação"
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filtroCard === 'PENDENTE'
            ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
            : 'bg-white border-gray-200 hover:border-rose-400 hover:bg-rose-50/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Total a Pagar (Aberto)
          </span>
          {filtroCard === 'PENDENTE' && <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
        </div>
        <div className="text-xl font-bold font-mono text-rose-700 mt-1">{formatBRL(totalAPagarAberto)}</div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Passivos pendentes • Clique para isolar</span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFiltro('PAGO')}
        title="Clique para filtrar apenas as despesas quitadas na competência"
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filtroCard === 'PAGO'
            ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
            : 'bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Pago (Mês Atual)
          </span>
          {filtroCard === 'PAGO' && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
        </div>
        <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{formatBRL(totalPagoMes)}</div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Despesas quitadas • Clique para isolar</span>
      </button>
    </div>
  );
};
