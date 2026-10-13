import React from 'react';

export type TipoRemuneracao = 'HORISTA' | 'DIARISTA' | 'MENSALISTA';

interface TipoRemuneracaoButtonsProps {
  tipo: TipoRemuneracao;
  onChange: (tipo: TipoRemuneracao) => void;
}

export const TipoRemuneracaoButtons: React.FC<TipoRemuneracaoButtonsProps> = ({ tipo, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h5 className="font-bold text-[11px] text-gray-800 uppercase tracking-wider">Remuneração e Regime de Trabalho</h5>
        <span className="text-[10px] text-gray-500">Defina se o operador é horista, diarista ou mensalista CLT</span>
      </div>
      <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
        {(['HORISTA', 'DIARISTA', 'MENSALISTA'] as const).map((t) => (
          <button
            key={t} type="button" onClick={() => onChange(t)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              tipo === t ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t === 'HORISTA' ? 'Horista' : t === 'DIARISTA' ? 'Diarista' : 'CLT Mensal'}
          </button>
        ))}
      </div>
    </div>
  );
};
