import React from 'react';
import { Search, Calendar, X, Clock, CheckCircle2 } from 'lucide-react';
import type { StatusFiltroServico } from './useServicosFiltros';

interface ServicoFiltrosBarProps {
  busca: string;
  setBusca: (v: string) => void;
  statusFiltro: StatusFiltroServico;
  setStatusFiltro: (v: StatusFiltroServico) => void;
  dataInicioFiltro: string;
  setDataInicioFiltro: (v: string) => void;
  dataFimFiltro: string;
  setDataFimFiltro: (v: string) => void;
  totalTodos: number;
  totalEmAndamento: number;
  totalFinalizados: number;
  temFiltroAtivo: boolean;
  onLimparFiltros: () => void;
}

export const ServicoFiltrosBar: React.FC<ServicoFiltrosBarProps> = ({
  busca,
  setBusca,
  statusFiltro,
  setStatusFiltro,
  dataInicioFiltro,
  setDataInicioFiltro,
  dataFimFiltro,
  setDataFimFiltro,
  totalTodos,
  totalEmAndamento,
  totalFinalizados,
  temFiltroAtivo,
  onLimparFiltros
}) => {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Campo de Busca */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar por cliente, máquina, operador ou obra..."
            className="w-full pl-8.5 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Abas Rápidas de Status */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setStatusFiltro('TODOS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFiltro === 'TODOS' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] bg-gray-200 px-1.5 py-0.2 rounded-full font-mono text-gray-700">{totalTodos}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('EM_ANDAMENTO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFiltro === 'EM_ANDAMENTO' ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs font-bold' : 'text-gray-600 hover:text-amber-800'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Em Andamento</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-mono">{totalEmAndamento}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro('FINALIZADO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFiltro === 'FINALIZADO' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs font-bold' : 'text-gray-600 hover:text-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Concluídos</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-full font-mono">{totalFinalizados}</span>
          </button>
        </div>

        {/* Filtros de Data */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs">
            <Calendar className="w-3 h-3 text-gray-400" />
            <input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="bg-transparent text-[11px] text-gray-700 focus:outline-none"
              title="Data inicial"
            />
            <span className="text-gray-400 text-[10px]">até</span>
            <input
              type="date"
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="bg-transparent text-[11px] text-gray-700 focus:outline-none"
              title="Data final"
            />
          </div>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={onLimparFiltros}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              title="Limpar todos os filtros"
            >
              <X className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
