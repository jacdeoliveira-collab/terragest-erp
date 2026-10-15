import { Printer, Trash2, X, CheckSquare, Clock, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface ServicoBulkActionsBarProps {
  totalSelecionados: number;
  totalDisponiveis: number;
  onSelecionarTodos: () => void;
  onSelecionarEmAndamento: () => void;
  onSelecionarConcluidos: () => void;
  onExportarPdf: () => void;
  onExportarExcel?: () => void;
  onExcluirSelecionados: () => void;
  onLimparSelecao: () => void;
}

export const ServicoBulkActionsBar: React.FC<ServicoBulkActionsBarProps> = ({
  totalSelecionados,
  totalDisponiveis,
  onSelecionarTodos,
  onSelecionarEmAndamento,
  onSelecionarConcluidos,
  onExportarPdf,
  onExportarExcel,
  onExcluirSelecionados,
  onLimparSelecao
}) => {
  if (totalSelecionados === 0) return null;

  return (
    <div className="p-2.5 px-4 bg-emerald-950 text-white rounded-2xl shadow-lg border border-emerald-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300 mr-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>{totalSelecionados} selecionado(s)</span>
        </div>

        <span className="text-emerald-500 text-[11px] hidden sm:inline">|</span>

        {/* Atalhos de Seleção Rápida */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSelecionarTodos}
            className="px-2 py-0.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
          >
            Todos ({totalDisponiveis})
          </button>
          <button
            type="button"
            onClick={onSelecionarEmAndamento}
            className="px-2 py-0.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            <span>Em Andamento</span>
          </button>
          <button
            type="button"
            onClick={onSelecionarConcluidos}
            className="px-2 py-0.5 bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/60 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Concluídos</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onExportarExcel && (
          <button
            type="button"
            onClick={onExportarExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Exportar serviços selecionados para planilha Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExportarPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Gera um relatório consolidado com todos os serviços selecionados em um único PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Exportar PDF Consolidado</span>
        </button>

        <button
          type="button"
          onClick={onExcluirSelecionados}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Excluir todos os serviços selecionados"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Excluir Selecionados</span>
        </button>

        <button
          type="button"
          onClick={onLimparSelecao}
          className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-900 rounded-lg cursor-pointer"
          title="Desmarcar todos"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
