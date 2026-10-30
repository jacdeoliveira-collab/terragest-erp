import React from 'react';
import { CheckCircle, Clock, FileDown, Edit, Trash2, Receipt, Play, MapPin } from 'lucide-react';
import type { Orcamento, StatusOrcamento } from '../../../../types/comercial.types';
import { gerarOrcamentoPDF } from '../../../../utils/orcamentoPdfGenerator';

interface OrcamentoRowItemProps {
  orc: Orcamento;
  onEditar: (orc: Orcamento) => void;
  onExcluir: (id: string) => void;
  onAtualizarStatus: (id: string, status: StatusOrcamento) => void;
  onAbrirRecibo: (orc: Orcamento) => void;
  onConverterEmServico: (orc: Orcamento) => void;
}

export const OrcamentoRowItem: React.FC<OrcamentoRowItemProps> = ({
  orc,
  onEditar,
  onExcluir,
  onAtualizarStatus,
  onAbrirRecibo,
  onConverterEmServico,
}) => {
  const isAprovado = orc.status === 'APROVADO' || orc.status === 'CONCLUIDO';
  const temAdiantamento = (orc.valor_adiantamento || 0) > 0;
  const det = orc.detalhes_proposta;
  const qtdMaquinas = det?.maquinas_itens?.length || 1;
  const primMaq = det?.maquinas_itens?.[0];
  const nomeMaq = primMaq?.maquina_nome || orc.maquina_nome || 'Máquina Linha Amarela';
  const codMaq = primMaq?.maquina_codigo || orc.maquina_codigo || 'FROTA';
  const modMaq = primMaq?.maquina_modelo || orc.maquina_modelo;
  const implMaq = primMaq?.implemento;

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3.5">
        <span className="font-bold text-gray-900 block">{orc.cliente_nome}</span>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <span className="text-[10px] text-amber-900 font-mono font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
            {codMaq}
          </span>
          <span className="text-[11px] text-gray-800 font-semibold">
            {nomeMaq}
          </span>
          {modMaq && (
            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
              {modMaq}
            </span>
          )}
          {qtdMaquinas > 1 && (
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
              +{qtdMaquinas - 1} máq.
            </span>
          )}
        </div>
        {implMaq && (
          <span className="text-[10px] text-gray-500 block mt-0.5">
            Implemento: <b className="text-gray-700">{implMaq}</b>
          </span>
        )}
      </td>

      <td className="p-3.5 max-w-xs">
        {det?.tipo_operacao && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mb-0.5">
            {det.tipo_operacao}
          </span>
        )}
        <span className="text-gray-700 block truncate font-medium" title={orc.descricao_servico}>
          {orc.descricao_servico}
        </span>
        {det?.local_obra && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            {det.local_obra}
          </span>
        )}
      </td>

      <td className="p-3.5 text-right font-mono font-medium">
        R$ {Number(orc.valor_hora || 0).toFixed(2)}
      </td>
      <td className="p-3.5 text-center font-mono">
        <span className="font-bold">{orc.horas_estimadas ?? 0}h</span>
        {primMaq?.franquia_minima && !primMaq.franquia_minima.includes('Sem Franquia') && (
          <span className="block text-[9px] text-amber-700">{primMaq.franquia_minima.replace('Franquia ', '')}</span>
        )}
      </td>
      <td className="p-3.5 text-right font-mono">
        <span className="font-bold text-gray-900 block">
          R$ {Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        {(det?.valor_mobilizacao || 0) > 0 && (
          <span className="text-[10px] text-blue-600 block">
            Prancha: R$ {Number(det?.valor_mobilizacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
        {temAdiantamento && (
          <span className="text-[10px] text-emerald-600 font-semibold block">
            Sinal: R$ {Number(orc.valor_adiantamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </td>
      <td className="p-3.5 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          isAprovado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isAprovado ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
          {orc.status}
        </span>
      </td>
      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button onClick={() => onConverterEmServico(orc)} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold cursor-pointer" title="Converter Proposta em Serviço por Horímetro (Gestão de Horas)">
            <Play className="w-3 h-3" /><span>Gerar OS</span>
          </button>
          <button onClick={() => onAbrirRecibo(orc)} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold cursor-pointer" title="Receber Adiantamento / Emitir Recibo">
            <Receipt className="w-3.5 h-3.5" /><span>Recibo</span>
          </button>
          <button onClick={() => gerarOrcamentoPDF(orc)} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold cursor-pointer" title="Gerar Proposta Comercial em PDF">
            <FileDown className="w-3 h-3 text-emerald-600" /><span>PDF</span>
          </button>
          <button onClick={() => onEditar(orc)} className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-gray-200 cursor-pointer" title="Editar Proposta">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onExcluir(orc.id)} className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-200 cursor-pointer" title="Excluir Proposta">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {!isAprovado && (
            <button onClick={() => onAtualizarStatus(orc.id, 'APROVADO')} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold cursor-pointer">
              Aprovar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
