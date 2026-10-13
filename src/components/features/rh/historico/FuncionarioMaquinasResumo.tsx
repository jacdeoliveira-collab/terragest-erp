import React from 'react';
import { Wrench, Clock, CheckCircle } from 'lucide-react';
import type { MaquinaOperadaResumo } from '../../../../types/funcionarioHistorico.types';

interface Props {
  maquinas: MaquinaOperadaResumo[];
}

export const FuncionarioMaquinasResumo: React.FC<Props> = ({ maquinas }) => {
  if (maquinas.length === 0) return null;

  return (
    <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3">
      <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
        <Wrench className="w-3.5 h-3.5 text-gray-600" />
        <span>Equipamentos Operados pelo Colaborador</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {maquinas.map((m) => (
          <div
            key={m.maquinaNome}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-2xs text-xs"
          >
            <span className="font-semibold text-gray-900">{m.maquinaNome}</span>
            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {m.totalHoras.toFixed(1)}h
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
              <CheckCircle className="w-3 h-3 text-gray-400" />
              {m.totalTrabalhos}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
