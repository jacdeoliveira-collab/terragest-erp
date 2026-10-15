import React from 'react';
import { Search, Calendar, Printer, X, FileSpreadsheet } from 'lucide-react';

export interface StatusFiltroOpcao {
  id?: string;
  valor?: string;
  label: string;
  count?: number;
  badgeClass?: string;
  cor?: string;
}
export type OpcaoStatus = StatusFiltroOpcao;

interface ListFilterBarProps {
  busca: string;
  onBuscaChange?: (val: string) => void;
  setBusca?: (val: string) => void;
  placeholder?: string;
  placeholderBusca?: string;
  statusOpcoes?: StatusFiltroOpcao[];
  opcoesStatus?: StatusFiltroOpcao[];
  statusAtivo?: string;
  statusFiltro?: string;
  onStatusChange?: (statusId: string) => void;
  setStatusFiltro?: (statusId: string) => void;
  dataInicio?: string;
  onDataInicioChange?: (val: string) => void;
  setDataInicio?: (val: string) => void;
  dataFim?: string;
  onDataFimChange?: (val: string) => void;
  setDataFim?: (val: string) => void;
  onExportarPdf?: () => void;
  exportarLabel?: string;
  labelExportar?: string;
  onExportarExcel?: () => void;
  labelExportarExcel?: string;
  onLimpar?: () => void;
  temFiltroAtivo?: boolean;
  totalFiltrados?: number;
  totalGeral?: number;
}

export const ListFilterBar: React.FC<ListFilterBarProps> = (props) => {
  const handleBusca = props.onBuscaChange || props.setBusca || (() => {});
  const placeholder = props.placeholderBusca || props.placeholder || 'Buscar...';
  const opcoes = props.opcoesStatus || props.statusOpcoes;
  const statusAtivo = props.statusFiltro || props.statusAtivo;
  const handleStatus = props.onStatusChange || props.setStatusFiltro;
  const handleDataIni = props.onDataInicioChange || props.setDataInicio;
  const handleDataFim = props.onDataFimChange || props.setDataFim;
  const labelExportar = props.labelExportar || props.exportarLabel || 'Exportar PDF';
  const labelExcel = props.labelExportarExcel || 'Exportar Excel';

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 text-xs text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={props.busca} onChange={(e) => handleBusca(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-8.5 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {props.busca && (
            <button type="button" onClick={() => handleBusca('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {opcoes && opcoes.length > 0 && handleStatus && (
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl shrink-0 overflow-x-auto">
            {opcoes.map((op) => {
              const opKey = op.id || op.valor || op.label;
              const isSelected = statusAtivo === opKey;
              return (
                <button
                  key={opKey} type="button" onClick={() => handleStatus(opKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{op.label}</span>
                  {op.count !== undefined && <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${op.badgeClass || 'bg-gray-200 text-gray-700'}`}>{op.count}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {handleDataIni && handleDataFim && (
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs">
              <Calendar className="w-3 h-3 text-gray-400" />
              <input type="date" value={props.dataInicio || ''} onChange={(e) => handleDataIni(e.target.value)} className="bg-transparent text-[11px] text-gray-700 focus:outline-none" title="Data inicial" />
              <span className="text-gray-400 text-[10px]">até</span>
              <input type="date" value={props.dataFim || ''} onChange={(e) => handleDataFim(e.target.value)} className="bg-transparent text-[11px] text-gray-700 focus:outline-none" title="Data final" />
            </div>
          )}

          {props.temFiltroAtivo && props.onLimpar && (
            <button type="button" onClick={props.onLimpar} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold cursor-pointer transition-all" title="Limpar filtros">
              <X className="w-3 h-3" /><span>Limpar</span>
            </button>
          )}

          {props.onExportarExcel && (
            <button type="button" onClick={props.onExportarExcel} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap" title="Exportar dados filtrados para planilha Excel (.xlsx)">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /><span>{labelExcel}</span>
            </button>
          )}

          {props.onExportarPdf && (
            <button type="button" onClick={props.onExportarPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap">
              <Printer className="w-3.5 h-3.5" /><span>{labelExportar}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
