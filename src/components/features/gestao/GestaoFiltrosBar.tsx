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
    <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Cruzamento de Dados</span>
        </div>
        <div className="flex items-center gap-2">
          {temCruzamento && (
            <button type="button" onClick={onLimpar} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-amber-300 cursor-pointer">
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          )}
          <button type="button" onClick={onRefresh} title="Atualizar dados" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer">
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
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filtros.periodo === p.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtros.periodo === 'PERSONALIZADO' && (
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={filtros.dataInicio} onChange={(e) => onChange('dataInicio', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs" />
          <input type="date" value={filtros.dataFim} onChange={(e) => onChange('dataFim', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs" />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-300">Máquina</span>
          <select value={filtros.maquinaId} onChange={(e) => onChange('maquinaId', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="w-full rounded-lg border border-slate-600 px-2.5 py-2 text-xs font-medium">
            <option value="" style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>Todas Máquinas</option>
            {opcoes.maquinas.map((m) => <option key={m.id} value={m.id} style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>{m.label}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-300">Cliente</span>
          <select value={filtros.clienteNome} onChange={(e) => onChange('clienteNome', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="w-full rounded-lg border border-slate-600 px-2.5 py-2 text-xs font-medium">
            <option value="" style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>Todos Clientes</option>
            {opcoes.clientes.map((c) => <option key={c} value={c} style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>{c}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-300">Operador</span>
          <select value={filtros.operadorNome} onChange={(e) => onChange('operadorNome', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="w-full rounded-lg border border-slate-600 px-2.5 py-2 text-xs font-medium">
            <option value="" style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>Todos Operadores</option>
            {opcoes.operadores.map((o) => <option key={o} value={o} style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>{o}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-bold uppercase text-slate-300">Centro de Custo</span>
          <select value={filtros.centroCustoId} onChange={(e) => onChange('centroCustoId', e.target.value)} style={{ color: '#ffffff', backgroundColor: '#1b1829' }} className="w-full rounded-lg border border-slate-600 px-2.5 py-2 text-xs font-medium">
            <option value="" style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>Todos Centros</option>
            {opcoes.centrosCusto.map((cc) => <option key={cc.id} value={cc.id} style={{ backgroundColor: '#1b1829', color: '#ffffff' }}>{cc.nome}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
};
