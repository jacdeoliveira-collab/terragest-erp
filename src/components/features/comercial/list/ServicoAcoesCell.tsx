import React from 'react';
import { FileDown, Edit2, Trash2, Receipt, FileCheck } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

interface ServicoAcoesCellProps {
  servico: ServicoHorimetro;
  onEditar: (s: ServicoHorimetro) => void;
  onExcluir: (id: string, cliente: string) => void;
  onGerarPdf: (s: ServicoHorimetro) => void;
  onGerarRelatorioCliente: (s: ServicoHorimetro) => void;
  onAbrirRecibo: (s: ServicoHorimetro) => void;
}

export const ServicoAcoesCell: React.FC<ServicoAcoesCellProps> = ({
  servico: s,
  onEditar,
  onExcluir,
  onGerarPdf,
  onGerarRelatorioCliente,
  onAbrirRecibo
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 pt-1.5 mt-1 border-t border-gray-100">
      <button
        type="button"
        onClick={() => onEditar(s)}
        title="Editar Serviço"
        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
      >
        <Edit2 className="w-3 h-3 text-amber-700" />
        <span>Editar</span>
      </button>
      <button
        type="button"
        onClick={() => onGerarRelatorioCliente(s)}
        title="Relatório Executivo do Cliente"
        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer"
      >
        <FileCheck className="w-3 h-3 text-blue-600" />
        <span>Relatório</span>
      </button>
      <button
        type="button"
        onClick={() => onAbrirRecibo(s)}
        title="Emitir Recibo / Adiantamento"
        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer"
      >
        <Receipt className="w-3 h-3 text-emerald-600" />
        <span>Recibo</span>
      </button>
      <button
        type="button"
        onClick={() => onGerarPdf(s)}
        title="Boletim PDF"
        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer"
      >
        <FileDown className="w-3 h-3 text-gray-600" />
        <span>PDF</span>
      </button>
      <button
        type="button"
        onClick={() => onExcluir(s.id, s.cliente_nome)}
        title="Excluir Serviço"
        className="p-1 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
