import React from 'react';
import { DollarSign, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import type { ClienteHistoricoData } from '../../../../hooks/useClienteHistorico';

export type ClienteHistoricoFiltro = 'todos' | 'adiantamentos' | 'pendentes' | 'horas';

interface Props {
  data: ClienteHistoricoData;
  filtroAtivo: ClienteHistoricoFiltro;
  onSelectFiltro: (filtro: ClienteHistoricoFiltro) => void;
}

export const ClienteHistoricoCards: React.FC<Props> = ({ data, filtroAtivo, onSelectFiltro }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
      {/* 1. Total Faturado */}
      <button
        type="button"
        onClick={() => onSelectFiltro('todos')}
        title="Clique para ver todos os contratos e faturamentos"
        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
          filtroAtivo === 'todos'
            ? 'bg-emerald-100/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
            : 'bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-100/50 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-700 text-[11px] mb-1">
          <div className="flex items-center gap-1 font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Faturado</span>
          </div>
          {filtroAtivo === 'todos' && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">ATIVO</span>}
        </div>
        <div className="text-sm sm:text-base font-bold text-emerald-800 font-mono">
          R$ {data.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
          {data.qtdServicos} contrato(s) • Ver todos
        </div>
      </button>

      {/* 2. Adiantamentos */}
      <button
        type="button"
        onClick={() => onSelectFiltro('adiantamentos')}
        title="Clique para filtrar apenas os adiantamentos e serviços quitados"
        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
          filtroAtivo === 'adiantamentos'
            ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
            : 'bg-amber-50/60 border-amber-200/80 hover:bg-amber-100/50 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700 text-[11px] mb-1">
          <div className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Adiantamentos</span>
          </div>
          {filtroAtivo === 'adiantamentos' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">ATIVO</span>}
        </div>
        <div className="text-sm sm:text-base font-bold text-amber-800 font-mono">
          R$ {data.totalAdiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-amber-600 font-medium mt-0.5">
          {data.qtdQuitados} serviço(s) quitado(s) • Filtrar
        </div>
      </button>

      {/* 3. Saldo Restante */}
      <button
        type="button"
        onClick={() => onSelectFiltro('pendentes')}
        title="Clique para filtrar os contratos com saldo em aberto pendente de acerto"
        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
          filtroAtivo === 'pendentes'
            ? 'bg-rose-100/80 border-rose-500 ring-2 ring-rose-500/40 shadow-sm'
            : 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-100/50 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-rose-700 text-[11px] mb-1">
          <div className="flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Saldo a Receber</span>
          </div>
          {filtroAtivo === 'pendentes' && <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">ATIVO</span>}
        </div>
        <div className="text-sm sm:text-base font-bold text-rose-800 font-mono">
          R$ {data.totalSaldoAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-rose-600 font-medium mt-0.5">
          {data.totalSaldoAberto > 0 ? 'Pendente de acerto • Filtrar' : 'Sem pendências'}
        </div>
      </button>

      {/* 4. Horas de Máquina */}
      <button
        type="button"
        onClick={() => onSelectFiltro('horas')}
        title="Clique para ordenar o extrato por horímetro e horas trabalhadas"
        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
          filtroAtivo === 'horas'
            ? 'bg-blue-100/80 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
            : 'bg-blue-50/60 border-blue-200/80 hover:bg-blue-100/50 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-blue-700 text-[11px] mb-1">
          <div className="flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Horas de Máquina</span>
          </div>
          {filtroAtivo === 'horas' && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">ATIVO</span>}
        </div>
        <div className="text-sm sm:text-base font-bold font-mono text-blue-800">
          {data.totalHoras.toFixed(1)} h
        </div>
        <div className="text-[10px] text-blue-600 mt-0.5">
          Lucro liq: R$ {data.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} • Ordenar
        </div>
      </button>
    </div>
  );
};

