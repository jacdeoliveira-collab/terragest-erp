import React, { useState } from 'react';
import { DollarSign, FileText, Trash2, CheckCircle2, Eye, X } from 'lucide-react';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';
import { gerarReciboPDF } from '../../../../utils/reciboPdfGenerator';
import { AdiantamentoFormInput } from './AdiantamentoFormInput';

interface Props {
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoServico: string;
  faturamentoBruto: number;
  adiantamentos: AdiantamentoItem[];
  onAdicionar: (item: Omit<AdiantamentoItem, 'id'>) => void;
  onRemover: (id: string) => void;
  onSalvarSinal?: () => Promise<boolean>;
}

export const AdiantamentosHistoricoSection: React.FC<Props> = ({
  clienteNome, clienteDocumento, clienteTelefone, descricaoServico,
  faturamentoBruto, adiantamentos, onAdicionar, onRemover, onSalvarSinal
}) => {
  const [sucesso, setSucesso] = useState(false);
  const [comprovanteVisualizar, setComprovanteVisualizar] = useState<string | null>(null);

  const totalRecebido = Number(adiantamentos.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2));
  const saldoRestante = Number(Math.max(0, faturamentoBruto - totalRecebido).toFixed(2));

  const handleAdd = (item: Omit<AdiantamentoItem, 'id'>) => {
    onAdicionar(item);
    if (onSalvarSinal) {
      setTimeout(async () => {
        await onSalvarSinal();
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }, 50);
    }
  };

  const handleRemover = (id: string) => {
    onRemover(id);
    if (onSalvarSinal) {
      setTimeout(() => onSalvarSinal(), 50);
    }
  };

  const handleEmitirReciboItem = (item: AdiantamentoItem, idx: number) => {
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
    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 text-left text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase tracking-wider">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Histórico de Recebimentos / A Haver do Cliente</span>
        </div>
        <span className="font-mono text-emerald-800 font-bold">
          Total Pago: R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <AdiantamentoFormInput onAdicionar={handleAdd} isFirst={adiantamentos.length === 0} />

      {sucesso && (
        <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Pagamento e comprovante gravados com sucesso!</span>
        </div>
      )}

      {adiantamentos.length > 0 && (
        <div className="divide-y divide-emerald-100 bg-white border border-emerald-200 rounded-lg max-h-40 overflow-y-auto">
          {adiantamentos.map((item, idx) => (
            <div key={item.id} className="p-2 flex items-center justify-between hover:bg-emerald-50/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">{item.data}</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">{item.forma_pagamento}</span>
                <span className="text-gray-700 font-medium">{item.observacao || `Parcela ${idx + 1}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-800">
                  R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {item.comprovante_url && (
                  <button type="button" onClick={() => setComprovanteVisualizar(item.comprovante_url || null)} title="Ver Comprovante" className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => handleEmitirReciboItem(item, idx)} title="Emitir Recibo em PDF" className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleRemover(item.id)} title="Excluir" className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-emerald-200 text-[11px]">
        <span>Faturamento: <strong>R$ {faturamentoBruto.toFixed(2)}</strong></span>
        <span className="text-emerald-700 font-bold">Total Recebido: <strong>R$ {totalRecebido.toFixed(2)}</strong></span>
        <span className={saldoRestante > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
          {saldoRestante > 0 ? `Saldo a Receber: R$ ${saldoRestante.toFixed(2)}` : '✓ Quitado'}
        </span>
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
    </div>
  );
};
