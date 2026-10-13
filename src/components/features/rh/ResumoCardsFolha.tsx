import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, AlertTriangle, Users, ExternalLink } from 'lucide-react';

export type FiltroFolha = 'TODOS' | 'EXTRAS' | 'ESTOURO';

interface Props {
  totalFolha: number;
  totalHorasExtrasValor: number;
  totalHorasExtrasQtd: number;
  operadoresComEstouro: number;
  totalOperadores: number;
  filtroAtivo?: FiltroFolha;
  onSelectFiltro?: (filtro: FiltroFolha) => void;
}

export const ResumoCardsFolha: React.FC<Props> = ({
  totalFolha,
  totalHorasExtrasValor,
  totalHorasExtrasQtd,
  operadoresComEstouro,
  totalOperadores,
  filtroAtivo = 'TODOS',
  onSelectFiltro
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
      {/* 1. Custo Total -> Contas a Pagar */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=pagar')}
        title="Clique para ir à origem: Contas a Pagar (Despesas de Pessoal)"
        className="bg-white hover:bg-emerald-50/40 border border-gray-200 hover:border-emerald-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group text-left"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 group-hover:text-emerald-700 flex items-center gap-1">
            Custo Total da Folha <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2 font-mono">
          R$ {totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[11px] text-gray-400">Salários base + Horas extras • Ver financeiro</span>
      </button>

      {/* 2. Adicional de H.E. -> Filtro de Horas Extras */}
      <button
        type="button"
        onClick={() => onSelectFiltro?.(filtroAtivo === 'EXTRAS' ? 'TODOS' : 'EXTRAS')}
        title="Clique para filtrar apenas os operadores que realizaram horas extras"
        className={`border rounded-2xl p-4 shadow-sm transition-all cursor-pointer text-left ${
          filtroAtivo === 'EXTRAS'
            ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-500/30'
            : 'bg-white hover:bg-amber-50/40 border-gray-200 hover:border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            Adicional de H.E.
            {filtroAtivo === 'EXTRAS' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-amber-600 mt-2 font-mono">
          R$ {totalHorasExtrasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[11px] text-gray-400">
          {totalHorasExtrasQtd.toFixed(1)}h extras apuradas • Filtrar
        </span>
      </button>

      {/* 3. Estouro de Limite -> Filtro de Estouro */}
      <button
        type="button"
        onClick={() => onSelectFiltro?.(filtroAtivo === 'ESTOURO' ? 'TODOS' : 'ESTOURO')}
        title="Clique para isolar operadores que excederam o limite diário"
        className={`border rounded-2xl p-4 shadow-sm transition-all cursor-pointer text-left ${
          filtroAtivo === 'ESTOURO'
            ? 'bg-rose-100/80 border-rose-500 ring-2 ring-rose-500/30'
            : 'bg-white hover:bg-rose-50/40 border-gray-200 hover:border-rose-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            Estouro de Limite
            {filtroAtivo === 'ESTOURO' && <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">FILTRANDO</span>}
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-lg font-bold mt-2 font-mono ${
            operadoresComEstouro > 0 ? 'text-rose-600' : 'text-gray-900'
          }`}
        >
          {operadoresComEstouro} operador(es)
        </p>
        <span className="text-[11px] text-gray-400">Excederam o limite • Filtrar</span>
      </button>

      {/* 4. Equipe Ativa -> Reset de Filtro */}
      <button
        type="button"
        onClick={() => onSelectFiltro?.('TODOS')}
        title="Clique para ver toda a equipe ativa"
        className={`border rounded-2xl p-4 shadow-sm transition-all cursor-pointer text-left ${
          filtroAtivo === 'TODOS'
            ? 'bg-blue-50/60 border-blue-400'
            : 'bg-white hover:bg-blue-50/30 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            Equipe Ativa
            {filtroAtivo === 'TODOS' && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">TODOS</span>}
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2 font-mono">{totalOperadores}</p>
        <span className="text-[11px] text-gray-400">Operadores e linha amarela • Ver todos</span>
      </button>
    </div>
  );
};
