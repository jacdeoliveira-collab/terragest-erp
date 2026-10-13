import React from 'react';
import { CheckCircle, Clock, FileDown, Edit, Trash2, Receipt } from 'lucide-react';
import type { Orcamento, StatusOrcamento } from '../../../../types/comercial.types';
import { gerarOrcamentoPDF } from '../../../../utils/orcamentoPdfGenerator';

interface OrcamentoRowItemProps {
  orc: Orcamento;
  onEditar: (orc: Orcamento) => void;
  onExcluir: (id: string) => void;
  onAtualizarStatus: (id: string, status: StatusOrcamento) => void;
  onAbrirRecibo: (orc: Orcamento) => void;
}

export const OrcamentoRowItem: React.FC<OrcamentoRowItemProps> = ({
  orc,
  onEditar,
  onExcluir,
  onAtualizarStatus,
  onAbrirRecibo,
}) => {
  const isAprovado = orc.status === 'APROVADO';
  const temAdiantamento = (orc.valor_adiantamento || 0) > 0;

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3.5">
        <span className="font-semibold text-gray-900 block">{orc.cliente_nome}</span>
        <span className="text-[10px] text-gray-400 font-mono">{orc.maquina_codigo || 'Linha Amarela'}</span>
      </td>
      <td className="p-3.5 max-w-xs truncate text-gray-600">{orc.descricao_servico}</td>
      <td className="p-3.5 text-right font-mono font-medium">R$ {Number(orc.valor_hora || 0).toFixed(2)}</td>
      <td className="p-3.5 text-center font-mono">{orc.horas_estimadas ?? 0}h</td>
      <td className="p-3.5 text-right font-mono">
        <span className="font-bold text-gray-900 block">
          R$ {Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        {temAdiantamento && (
          <span className="text-[10px] text-emerald-600 font-semibold block">
            Sinal: R$ {Number(orc.valor_adiantamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </td>
      <td className="p-3.5 text-center">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isAprovado
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isAprovado ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
          {orc.status}
        </span>
      </td>
      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1">
          {/* Botão de Adiantamento e Recibo */}
          <button
            onClick={() => onAbrirRecibo(orc)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold cursor-pointer"
            title="Receber Adiantamento / Emitir Recibo"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Recibo</span>
          </button>

          <button
            onClick={() => gerarOrcamentoPDF(orc)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold cursor-pointer"
            title="Gerar Proposta em PDF"
          >
            <FileDown className="w-3 h-3 text-emerald-600" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => onEditar(orc)}
            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-gray-200 cursor-pointer"
            title="Editar Proposta"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onExcluir(orc.id)}
            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-200 cursor-pointer"
            title="Excluir Proposta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {!isAprovado && (
            <button
              onClick={() => onAtualizarStatus(orc.id, 'APROVADO')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold cursor-pointer"
            >
              Aprovar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
