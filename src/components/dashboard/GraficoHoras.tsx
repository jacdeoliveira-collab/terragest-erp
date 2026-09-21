import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { PontoGraficoHoras } from '../../types/dashboard.types';

interface GraficoHorasProps {
  dados: PontoGraficoHoras[];
}

export const GraficoHoras: React.FC<GraficoHorasProps> = ({ dados }) => {
  const temDados = dados.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[360px]">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Evolução de Horas Trabalhadas</h3>
          <p className="text-xs text-gray-400">Total de horas apontadas nos boletins diários por data</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
          <BarChart3 className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {!temDados ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Nenhuma operação registrada neste período</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Os dados serão desenhados automaticamente assim que forem emitidos os primeiros BDEs.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="horas" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
