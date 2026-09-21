import React from 'react';
import { DollarSign, Clock, AlertTriangle, Users } from 'lucide-react';

interface Props {
  totalFolha: number;
  totalHorasExtrasValor: number;
  totalHorasExtrasQtd: number;
  operadoresComEstouro: number;
  totalOperadores: number;
}

export const ResumoCardsFolha: React.FC<Props> = ({
  totalFolha,
  totalHorasExtrasValor,
  totalHorasExtrasQtd,
  operadoresComEstouro,
  totalOperadores
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Custo Total da Folha</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2 font-mono">
          R$ {totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[11px] text-gray-400">Salários base + Horas extras</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Adicional de H.E.</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-amber-600 mt-2 font-mono">
          R$ {totalHorasExtrasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <span className="text-[11px] text-gray-400">
          {totalHorasExtrasQtd.toFixed(1)}h extras apuradas
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Estouro de Limite</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-lg font-bold mt-2 font-mono ${
            operadoresComEstouro > 0 ? 'text-rose-600' : 'text-gray-900'
          }`}
        >
          {operadoresComEstouro} operador(es)
        </p>
        <span className="text-[11px] text-gray-400">Excederam o limite diário de horas</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Equipe Ativa</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2 font-mono">{totalOperadores}</p>
        <span className="text-[11px] text-gray-400">Operadores e linha amarela</span>
      </div>
    </div>
  );
};
