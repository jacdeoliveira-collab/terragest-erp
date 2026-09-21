import React from 'react';
import { HardHat } from 'lucide-react';

interface ObraNaoSelecionadaAvisoProps {
  onCancel: () => void;
}

export const ObraNaoSelecionadaAviso: React.FC<ObraNaoSelecionadaAvisoProps> = ({ onCancel }) => (
  <div className="p-8 text-center bg-amber-50/70 border border-amber-200 rounded-2xl">
    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-3">
      <HardHat className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-bold text-amber-900 mb-1">Centro de Custo Não Selecionado</h4>
    <p className="text-xs text-amber-800 max-w-sm mx-auto mb-4">
      ⚠️ Selecione uma obra ativa no cabeçalho do sistema para realizar apontamentos.
    </p>
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 bg-white hover:bg-gray-50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl cursor-pointer"
    >
      Fechar
    </button>
  </div>
);
