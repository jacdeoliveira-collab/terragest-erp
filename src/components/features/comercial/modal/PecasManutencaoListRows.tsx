import React from 'react';
import { Trash2, Pencil, ExternalLink, FileText, CheckCircle2, Clock, Table } from 'lucide-react';
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
      <div className="p-4 text-center text-xs text-gray-500 bg-white border border-dashed border-orange-200 rounded-xl space-y-1">
        <Table className="w-5 h-5 mx-auto text-orange-300" />
        <p className="font-semibold text-gray-700">Nenhuma despesa ou compra lançada nesta planilha.</p>
        <p className="text-[11px] text-gray-400">Preencha o formulário acima para registrar cada gasto separadamente em uma nova linha.</p>
      </div>
    );
  }

  const formatarData = (d?: string) => {
    if (!d) return '--/--/----';
    const [y, m, dia] = d.slice(0, 10).split('-');
    return dia && m && y ? `${dia}/${m}/${y}` : d;
  };

  const totalGeral = itens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

  return (
    <div className="border border-orange-200/90 rounded-xl bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-orange-100/70 border-b border-orange-200 text-orange-950 font-bold text-[11px] select-none sticky top-0 z-10">
              <th className="py-2 px-2.5 whitespace-nowrap">Data</th>
              <th className="py-2 px-2.5">Descrição / Peça / Aplicação</th>
              <th className="py-2 px-2.5">Fornecedor / Mecânica</th>
              <th className="py-2 px-2.5 whitespace-nowrap">Forma / Status</th>
              <th className="py-2 px-2.5 text-center whitespace-nowrap">Anexo</th>
              <th className="py-2 px-2.5 text-right whitespace-nowrap">Valor (R$)</th>
              <th className="py-2 px-2 text-center whitespace-nowrap w-16">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {itens.map((it, idx) => {
              const fornLimpo = removerTagEmprestimo(it.fornecedor) || '-';
              const isPago = it.status_pagamento === 'PAGO';
              const isEditando = editandoId === it.id;
              return (
                <tr
                  key={it.id || idx}
                  className={`transition-colors ${
                    isEditando
                      ? 'bg-amber-100/70 font-semibold'
                      : idx % 2 === 0 ? 'bg-white hover:bg-orange-50/40' : 'bg-orange-50/20 hover:bg-orange-50/40'
                  }`}
                >
                  <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] text-gray-700 font-semibold">
                    {formatarData(it.data)}
                  </td>
                  <td className="py-2 px-2.5 text-gray-900 font-medium max-w-[200px] truncate" title={it.descricao}>
                    {it.descricao}
                  </td>
                  <td className="py-2 px-2.5 text-gray-600 text-[11px] max-w-[160px] truncate" title={fornLimpo}>
                    {fornLimpo}
                  </td>
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-700">
                      <span className="font-medium">{it.forma_pagamento || 'PIX'}</span>
                      <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold ${
                        isPago ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isPago ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {isPago ? 'Pago' : 'Pend.'}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-center whitespace-nowrap">
                    {it.comprovante_url ? (
                      <button
                        type="button"
                        onClick={() => abrirVisualizacaoImagem(it.comprovante_url!, it.descricao)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        title="Ver Comprovante no Google Drive"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>Ver</span>
                        <ExternalLink className="w-2 h-2" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Sem anexo</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                    R$ {Number(it.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {onEditar && (
                        <button
                          type="button"
                          onClick={() => onEditar(it)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isEditando
                              ? 'bg-amber-300 text-amber-950 font-bold'
                              : 'text-gray-500 hover:text-amber-800 hover:bg-amber-100'
                          }`}
                          title="Editar linha da planilha"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={excluindoId === it.id}
                        onClick={() => onExcluir(it.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors disabled:opacity-50"
                        title="Excluir linha da planilha"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-orange-50/80 border-t border-orange-200 font-bold text-xs text-orange-950">
              <td colSpan={5} className="py-2 px-2.5 text-left">
                Total da Planilha ({itens.length} {itens.length === 1 ? 'item' : 'despesas lançadas'}):
              </td>
              <td className="py-2 px-2.5 text-right font-mono text-sm text-orange-950">
                R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
