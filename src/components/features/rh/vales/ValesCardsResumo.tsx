import React from 'react';
import { DollarSign, FileCheck, Users } from 'lucide-react';
import type { ValeColaboradorItem } from '../../../../types/valeRh.types';

interface Props {
  vales: ValeColaboradorItem[];
}

export const ValesCardsResumo: React.FC<Props> = ({ vales }) => {
  const totalValor = vales.reduce((acc, v) => acc + (Number(v.valor) || 0), 0);
  const totalColaboradores = new Set(vales.map((v) => v.colaboradorNome)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between text-left">
        <div>
          <p className="text-[11px] text-gray-500 font-medium">Total em Vales & Haveres</p>
          <p className="text-lg font-bold text-emerald-700">
            R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between text-left">
        <div>
          <p className="text-[11px] text-gray-500 font-medium">Quantidade de Vales</p>
          <p className="text-lg font-bold text-gray-900">{vales.length} recibos</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <FileCheck className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between text-left">
        <div>
          <p className="text-[11px] text-gray-500 font-medium">Colaboradores Beneficiados</p>
          <p className="text-lg font-bold text-purple-700">{totalColaboradores} pessoas</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <Users className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

