import React from 'react';
import { Trash2, Pencil, ExternalLink, FileText, CheckCircle2, Clock } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { removerTagEmprestimo } from '../../../../utils/emprestimoHelper';
import type { DespesaItemServico } from '../../../../types/servicoHorimetro.types';

interface Props {
  itens: DespesaItemServico[];
  onEditar?: (item: DespesaItemServico) => void;
  onExcluir: (id: string) => Promise<void> | void;
  excluindoId?: string | null;
  editandoId?: string | null;
}

export const PecasManutencaoListRows: React.FC<Props> = ({ itens, onEditar, onExcluir, excluindoId, editandoId }) => {
  if (itens.length === 0) {
    return (
      <div className="p-3 text-center text-xs text-gray-500 bg-orange-50/30 border border-dashed border-orange-200 rounded-xl">
        Nenhuma despesa de peças ou manutenção lançada neste serviço.
      </div>
    );
  }

  const formatarData = (d?: string) => {
    if (!d) return '--/--/----';
    const [y, m, dia] = d.slice(0, 10).split('-');
    return dia && m && y ? `${dia}/${m}/${y}` : d;
  };

  return (
    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
      {itens.map((it) => {
        const fornLimpo = removerTagEmprestimo(it.fornecedor);
        const isPago = it.status_pagamento === 'PAGO';
        const isEditando = editandoId === it.id;
        return (
          <div
            key={it.id}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
              isEditando
                ? 'bg-amber-50 border-2 border-amber-400 shadow-xs'
                : 'bg-white border border-orange-200/80 hover:border-orange-300'
            }`}
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                  {formatarData(it.data)}
                </span>
                <span className="font-bold text-gray-900 truncate">{it.descricao}</span>
                {fornLimpo && (
                  <span className="text-[11px] text-gray-500 truncate hidden sm:inline">
                    • {fornLimpo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                <span className="text-gray-500 font-medium">{it.forma_pagamento}</span>
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-semibold ${isPago ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {isPago ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isPago ? 'Pago' : 'Pendente'}
                </span>
                {it.comprovante_url && (
                  <button type="button" onClick={() => abrirVisualizacaoImagem(it.comprovante_url!, it.descricao)} className="text-orange-700 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer">
                    <FileText className="w-3 h-3" />
                    <span>Ver Anexo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono font-bold text-sm text-orange-950 mr-1">
                R$ {Number(it.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {onEditar && (
                <button
                  type="button"
                  onClick={() => onEditar(it)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isEditando
                      ? 'bg-amber-200 text-amber-900 font-bold'
                      : 'text-gray-500 hover:text-amber-700 hover:bg-amber-100/70'
                  }`}
                  title="Editar despesa"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                disabled={excluindoId === it.id}
                onClick={() => onExcluir(it.id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                title="Excluir despesa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
