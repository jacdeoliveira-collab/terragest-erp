import React from 'react';
import { Clock, ArrowDownLeft } from 'lucide-react';

interface ContasReceberKpiCardsProps {
  totalAReceber: number;
  recebidoNoMes: number;
  filtroCard: 'TODOS' | 'PENDENTE' | 'RECEBIDO';
  onToggleFiltro: (filtro: 'PENDENTE' | 'RECEBIDO') => void;
}

const formatBRL = (val: number) => (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ContasReceberKpiCards: React.FC<ContasReceberKpiCardsProps> = ({
  totalAReceber,
  recebidoNoMes,
  filtroCard,
  onToggleFiltro
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
      <button
        type="button"
        onClick={() => onToggleFiltro('PENDENTE')}
        title="Clique para filtrar apenas os saldos em aberto"
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filtroCard === 'PENDENTE'
            ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
            : 'bg-white border-gray-200 hover:border-amber-400 hover:bg-amber-50/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Total a Receber (Saldo em Aberto)
          </span>
          {filtroCard === 'PENDENTE' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
        </div>
        <div className="text-xl font-bold font-mono text-amber-700 mt-1">{formatBRL(totalAReceber)}</div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Clique para isolar faturamentos pendentes</span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFiltro('RECEBIDO')}
        title="Clique para filtrar apenas os títulos liquidados ou com adiantamento"
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filtroCard === 'RECEBIDO'
            ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
            : 'bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Recebido / Haveres no Mês
          </span>
          {filtroCard === 'RECEBIDO' && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
        </div>
        <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{formatBRL(recebidoNoMes)}</div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Clique para isolar títulos quitados/adiantados</span>
      </button>
    </div>
  );
};
