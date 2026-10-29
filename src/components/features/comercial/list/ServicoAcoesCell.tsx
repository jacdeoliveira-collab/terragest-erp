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
    <td className="py-3 px-4 text-right">
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onGerarRelatorioCliente(s)}
          title="Relatório Executivo"
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
        >
          <FileCheck className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAbrirRecibo(s)}
          title="Emitir Recibo"
          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
        </button>
        <button
          onClick={() => onGerarPdf(s)}
          title="Boletim PDF"
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEditar(s)}
          title="Editar"
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onExcluir(s.id, s.cliente_nome)}
          title="Excluir"
          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  );
};
