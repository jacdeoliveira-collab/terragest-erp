import React from 'react';

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ReactNode;
  corDestaque?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  titulo,
  valor,
  subtitulo,
  icone,
  corDestaque = 'emerald'
}) => {
  const coresIcone = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  }[corDestaque];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
          {titulo}
        </span>
        <span className="text-2xl font-bold text-gray-900 tracking-tight font-mono block">
          {valor}
        </span>
        {subtitulo && (
          <span className="text-xs text-gray-500 mt-1 block">
            {subtitulo}
          </span>
        )}
      </div>

      <div className={`p-3 rounded-xl border ${coresIcone}`}>
        {icone}
      </div>
    </div>
  );
};
