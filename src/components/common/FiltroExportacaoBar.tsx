import React from 'react';
import { FileSpreadsheet, FileText, Calendar, Filter } from 'lucide-react';

interface Props {
  dataInicio: string;
  setDataInicio: (d: string) => void;
  dataFim: string;
  setDataFim: (d: string) => void;
  status: string;
  setStatus: (s: any) => void;
  statusOptions: Array<{ valor: string; label: string }>;
  onExportarPdf: () => void;
  onExportarExcel: () => void;
  totalFiltrados: number;
}

export const FiltroExportacaoBar: React.FC<Props> = ({
  dataInicio, setDataInicio, dataFim, setDataFim,
  status, setStatus, statusOptions,
  onExportarPdf, onExportarExcel, totalFiltrados
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-gray-700">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filtrar:</span>
        </span>

        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-300">
          <Calendar className="w-3 h-3 text-gray-400" />
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="text-xs outline-none bg-transparent"
            title="Data Inicial"
          />
          <span className="text-gray-400 text-[10px]">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="text-xs outline-none bg-transparent"
            title="Data Final"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.valor} value={opt.valor}>{opt.label}</option>
          ))}
        </select>

        <span className="text-[11px] font-semibold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-md">
          {totalFiltrados} registros
        </span>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={onExportarExcel}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel</span>
        </button>
        <button
          type="button"
          onClick={onExportarPdf}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
};

