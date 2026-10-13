import React, { useState } from 'react';
import { DollarSign, FileText, CheckCircle2, X } from 'lucide-react';
import { gerarReciboPDF } from '../../../../utils/reciboPdfGenerator';
import { ReciboFormFields } from './ReciboFormFields';

interface ReciboAdiantamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoOriginal: string;
  valorTotalOriginal?: number;
  valorInicial?: number;
  onConfirmarAdiantamento?: (valor: number, forma: string, data: string) => Promise<void> | void;
}

export const ReciboAdiantamentoModal: React.FC<ReciboAdiantamentoModalProps> = ({
  isOpen, onClose, clienteNome, clienteDocumento, clienteTelefone,
  descricaoOriginal, valorTotalOriginal = 0, valorInicial = 0, onConfirmarAdiantamento
}) => {
  const [valor, setValor] = useState<number>(valorInicial || (valorTotalOriginal ? valorTotalOriginal * 0.3 : 0));
  const [formaPagamento, setFormaPagamento] = useState<string>('PIX');
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().slice(0, 10));
  const [referente, setReferente] = useState<string>(
    `Adiantamento / Sinal referente à prestação de serviços: ${descricaoOriginal}`
  );
  const [observacoes, setObservacoes] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<boolean>(false);

  if (!isOpen) return null;

  const numeroRecibo = `REC-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  const handleGerarPdf = () => {
    gerarReciboPDF({
      numeroRecibo, valor: Number(valor),
      clienteNome, clienteDocumento, clienteTelefone,
      dataPagamento, formaPagamento, referente, observacoes
    });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      if (onConfirmarAdiantamento) {
        await onConfirmarAdiantamento(Number(valor), formaPagamento, dataPagamento);
      }
      handleGerarPdf();
      setSucesso(true);
      setTimeout(() => { setSucesso(false); onClose(); }, 1500);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs text-xs text-left">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-100" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Emitir Recibo de Sinal / Adiantamento</h3>
              <p className="text-[11px] text-emerald-100">Cliente: {clienteNome}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ReciboFormFields
          valor={valor} setValor={setValor}
          formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento}
          dataPagamento={dataPagamento} setDataPagamento={setDataPagamento}
          referente={referente} setReferente={setReferente}
          observacoes={observacoes} setObservacoes={setObservacoes}
        />

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button" onClick={handleGerarPdf}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visualizar Recibo (PDF)</span>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-semibold rounded-xl cursor-pointer">
              Cancelar
            </button>
            <button
              type="button" onClick={handleSalvar} disabled={salvando || !valor || valor <= 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {sucesso ? <CheckCircle2 className="w-4 h-4 text-white" /> : <DollarSign className="w-4 h-4" />}
              <span>{salvando ? 'Salvando...' : sucesso ? 'Registrado!' : 'Confirmar & Emitir Recibo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
