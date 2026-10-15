import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ConfirmarConclusaoSemHorimetroModalProps {
  isOpen: boolean;
  clienteNome: string;
  maquinaNome?: string;
  onVoltar: () => void;
  onConfirmarConclusao: () => void;
}

export const ConfirmarConclusaoSemHorimetroModal: React.FC<ConfirmarConclusaoSemHorimetroModalProps> = ({
  isOpen,
  clienteNome,
  maquinaNome,
  onVoltar,
  onConfirmarConclusao
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 text-left">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Concluir Serviço sem Horímetro Final?
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Mensagem de segurança operacional do TerraGest
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
          <p className="font-semibold text-xs">
            Você está concluindo o serviço do cliente{' '}
            <span className="font-bold underline">{clienteNome || 'Selecionado'}</span>
            {maquinaNome ? ` na máquina ${maquinaNome}` : ''} sem informar o Horímetro Final.
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
            <li>As <b>horas trabalhadas</b> serão calculadas como <b>0.0 h</b>.</li>
            <li>O <b>faturamento bruto</b> deste serviço ficará <b>R$ 0,00</b>.</li>
            <li>Se o equipamento ainda está em campo, use <b>Salvar em Andamento</b>.</li>
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onConfirmarConclusao}
            className="w-full sm:w-auto px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold border border-rose-200 transition-all cursor-pointer text-center"
          >
            Sim, Concluir sem Horímetro
          </button>
          <button
            type="button"
            onClick={onVoltar}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar e Informar Horímetro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
