import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ServicoModalFooterProps {
  onClose: () => void;
  salvando: boolean;
  enviandoFoto?: boolean;
  onSalvarEmAndamento: () => void;
  onConcluirServico: () => void;
}

export const ServicoModalFooter: React.FC<ServicoModalFooterProps> = ({
  onClose, salvando, enviandoFoto, onSalvarEmAndamento, onConcluirServico
}) => {
  const bloqueado = salvando || Boolean(enviandoFoto);

  return (
    <div className="p-3.5 px-5 bg-gray-100 border-t border-gray-200 flex items-center justify-between gap-3 text-xs">
      <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold cursor-pointer">
        Cancelar
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={bloqueado}
          onClick={onSalvarEmAndamento}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{enviandoFoto ? 'Enviando foto ao Drive...' : 'Salvar em Andamento'}</span>
        </button>
        <button
          type="button"
          disabled={bloqueado}
          onClick={onConcluirServico}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{enviandoFoto ? 'Enviando foto ao Drive...' : 'Concluir Serviço'}</span>
        </button>
      </div>
    </div>
  );
};
