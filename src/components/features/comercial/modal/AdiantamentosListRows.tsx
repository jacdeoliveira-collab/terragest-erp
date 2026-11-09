import React from 'react';
import { FileText, Trash2, Pencil, Eye, Tag } from 'lucide-react';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';
import { gerarReciboPDF } from '../../../../utils/reciboPdfGenerator';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';

interface Props {
  adiantamentos: AdiantamentoItem[];
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoServico: string;
  onRemover: (id: string) => void;
  onEditar?: (item: AdiantamentoItem) => void;
  editandoId?: string | null;
}

export const AdiantamentosListRows: React.FC<Props> = ({
  adiantamentos, clienteNome, clienteDocumento, clienteTelefone, descricaoServico,
  onRemover, onEditar, editandoId
}) => {
  const handleEmitirRecibo = (item: AdiantamentoItem, idx: number) => {
    gerarReciboPDF({
      numeroRecibo: `REC-${new Date().getFullYear()}/${item.id.slice(-4).toUpperCase()}`,
      valor: Number(item.valor),
      clienteNome: clienteNome || 'Cliente',
      clienteDocumento, clienteTelefone,
      dataPagamento: item.data,
      formaPagamento: item.forma_pagamento,
      referente: `${item.observacao || `Parcela ${idx + 1}`} referente ao serviço: ${descricaoServico || 'Operação de Máquinas'}`
    });
  };

  return (
    <div className="divide-y divide-emerald-100 bg-white border border-emerald-200 rounded-lg max-h-40 overflow-y-auto">
      {adiantamentos.map((item, idx) => {
        const isDesc = item.forma_pagamento === 'DESCONTO';
        const isEditando = editandoId === item.id;
        return (
          <div key={item.id} className={`p-2 flex items-center justify-between text-[11px] transition-all ${isEditando ? 'bg-amber-100/70 border-l-4 border-amber-500' : 'hover:bg-emerald-50/40'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-gray-500 font-bold">{item.data}</span>
              <span className={`px-1.5 py-0.5 font-semibold rounded text-[10px] flex items-center gap-1 ${
                isDesc ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isDesc && <Tag className="w-2.5 h-2.5" />}
                {item.forma_pagamento}
              </span>
              <span className="text-gray-700 font-medium truncate">{item.observacao || `Parcela ${idx + 1}`}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`font-mono font-bold mr-1 ${isDesc ? 'text-amber-700' : 'text-emerald-800'}`}>
                {isDesc ? '(-) ' : ''}R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {item.comprovante_url && (
                <button
                  type="button"
                  onClick={() => abrirVisualizacaoImagem(item.comprovante_url, `Comprovante - ${clienteNome}`)}
                  title="Ver Comprovante"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 font-bold text-[10px] cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Comprovante</span>
                </button>
              )}
              {!isDesc && (
                <button type="button" onClick={() => handleEmitirRecibo(item, idx)} title="Emitir Recibo em PDF" className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                </button>
              )}
              {onEditar && (
                <button
                  type="button"
                  onClick={() => onEditar(item)}
                  title="Editar Lançamento"
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    isEditando ? 'bg-amber-200 text-amber-900 font-bold' : 'text-gray-500 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" onClick={() => onRemover(item.id)} title="Excluir" className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
