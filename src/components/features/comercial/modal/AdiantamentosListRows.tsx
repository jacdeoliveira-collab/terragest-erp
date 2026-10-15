import React, { useState } from 'react';
import { FileText, Trash2, Eye, X, Tag } from 'lucide-react';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';
import { gerarReciboPDF } from '../../../../utils/reciboPdfGenerator';

interface Props {
  adiantamentos: AdiantamentoItem[];
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoServico: string;
  onRemover: (id: string) => void;
}

export const AdiantamentosListRows: React.FC<Props> = ({
  adiantamentos, clienteNome, clienteDocumento, clienteTelefone, descricaoServico, onRemover
}) => {
  const [comprovanteVisualizar, setComprovanteVisualizar] = useState<string | null>(null);

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
    <>
      <div className="divide-y divide-emerald-100 bg-white border border-emerald-200 rounded-lg max-h-40 overflow-y-auto">
        {adiantamentos.map((item, idx) => {
          const isDesc = item.forma_pagamento === 'DESCONTO';
          return (
            <div key={item.id} className="p-2 flex items-center justify-between hover:bg-emerald-50/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">{item.data}</span>
                <span className={`px-1.5 py-0.5 font-semibold rounded text-[10px] flex items-center gap-1 ${
                  isDesc ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isDesc && <Tag className="w-2.5 h-2.5" />}
                  {item.forma_pagamento}
                </span>
                <span className="text-gray-700 font-medium">{item.observacao || `Parcela ${idx + 1}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${isDesc ? 'text-amber-700' : 'text-emerald-800'}`}>
                  {isDesc ? '(-) ' : ''}R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {item.comprovante_url && (
                  <button type="button" onClick={() => setComprovanteVisualizar(item.comprovante_url || null)} title="Ver Comprovante" className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                {!isDesc && (
                  <button type="button" onClick={() => handleEmitirRecibo(item, idx)} title="Emitir Recibo em PDF" className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />
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

      {comprovanteVisualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs" onClick={() => setComprovanteVisualizar(null)}>
          <div className="relative bg-white rounded-2xl p-2 max-w-lg max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setComprovanteVisualizar(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80">
              <X className="w-4 h-4" />
            </button>
            <img src={comprovanteVisualizar} alt="Comprovante de Pagamento" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
};
