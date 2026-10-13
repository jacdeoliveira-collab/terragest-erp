import React from 'react';
import { Gauge, X } from 'lucide-react';

interface ServicoModalHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  aba: 'geral' | 'horimetros' | 'despesas' | 'fotos' | 'resumo';
  setAba: (aba: 'geral' | 'horimetros' | 'despesas' | 'fotos' | 'resumo') => void;
}

export const ServicoModalHeader: React.FC<ServicoModalHeaderProps> = ({
  isEditing, onClose, aba, setAba
}) => {
  const tabs = [
    { id: 'geral', label: '1. Geral' },
    { id: 'horimetros', label: '2. Horímetros & Fotos' },
    { id: 'despesas', label: '3. Despesas' },
    { id: 'fotos', label: '4. Financeiro & Pagamentos' },
    { id: 'resumo', label: '5. Resumo & Lucro' }
  ] as const;

  return (
    <>
      <div className="p-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">
              {isEditing ? 'Editar Serviço por Horímetro' : 'Novo Serviço por Horímetro (Locação)'}
            </h3>
            <p className="text-[10px] text-emerald-100">
              Empresa: <strong>J A C DE OLIVEIRA</strong> • Medição com fotos, diesel e lucro líquido
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 text-xs font-semibold gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAba(t.id)}
            className={`px-3 py-2.5 border-b-2 transition-all cursor-pointer shrink-0 ${
              aba === t.id ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
};
