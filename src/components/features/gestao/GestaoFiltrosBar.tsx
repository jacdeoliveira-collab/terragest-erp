import React from 'react';
import { Filter, RefreshCw, RotateCcw } from 'lucide-react';
import type { GestaoBIFiltros, GestaoBIOpcoesFiltro, PeriodoGestaoBI } from '../../../types/gestaoBI.types';

interface Props {
  filtros: GestaoBIFiltros;
  opcoes: GestaoBIOpcoesFiltro;
  isLoading: boolean;
  onChange: <K extends keyof GestaoBIFiltros>(key: K, val: GestaoBIFiltros[K]) => void;
  onLimpar: () => void;
  onRefresh: () => void;
}

const PERIODOS: { id: PeriodoGestaoBI; label: string }[] = [
  { id: 'MES_ATUAL', label: 'Mês Atual' },
  { id: '30D', label: '30 dias' },
  { id: '90D', label: '90 dias' },
  { id: 'ANO', label: 'Ano' },
  { id: 'TUDO', label: 'Tudo' },
  { id: 'PERSONALIZADO', label: 'Período' }
];

export const GestaoFiltrosBar: React.FC<Props> = ({ filtros, opcoes, isLoading, onChange, onLimpar, onRefresh }) => {
  const temCruzamento = Boolean(filtros.maquinaId || filtros.clienteNome || filtros.operadorNome || filtros.centroCustoId || filtros.periodo !== 'MES_ATUAL');

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Cruzamento de Dados</span>
        </div>
        <div className="flex items-center gap-2">
          {temCruzamento && (
            <button type="button" onClick={onLimpar} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800 cursor-pointer">
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          )}
          <button type="button" onClick={onRefresh} title="Atualizar dados" className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange('periodo', p.id)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              filtros.periodo === p.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtros.periodo === 'PERSONALIZADO' && (
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={filtros.dataInicio} onChange={(e) => onChange('dataInicio', e.target.value)} className="rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900" />
          <input type="date" value={filtros.dataFim} onChange={(e) => onChange('dataFim', e.target.value)} className="rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900" />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-600">Máquina</span>
          <select value={filtros.maquinaId} onChange={(e) => onChange('maquinaId', e.target.value)} className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900">
            <option value="">Todas Máquinas</option>
            {opcoes.maquinas.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-600">Cliente</span>
          <select value={filtros.clienteNome} onChange={(e) => onChange('clienteNome', e.target.value)} className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900">
            <option value="">Todos Clientes</option>
            {opcoes.clientes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-600">Operador</span>
          <select value={filtros.operadorNome} onChange={(e) => onChange('operadorNome', e.target.value)} className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900">
            <option value="">Todos Operadores</option>
            {opcoes.operadores.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-600">Centro de Custo</span>
          <select value={filtros.centroCustoId} onChange={(e) => onChange('centroCustoId', e.target.value)} className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900">
            <option value="">Todos Centros</option>
            {opcoes.centrosCusto.map((cc) => <option key={cc.id} value={cc.id}>{cc.nome}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
};
