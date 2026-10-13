import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingDown, Gauge } from 'lucide-react';
import { useBDE } from '../../../hooks/useBDE';
import { useServicosHorimetro } from '../../../hooks/useServicosHorimetro';
import { calcularPontosEficiencia, type PontoEficiencia } from '../../../services/dashboardHorasHelper';

export const EficienciaChart: React.FC = () => {
  const { data: bulletins, isLoading: loadingBde } = useBDE();
  const { servicos, isLoading: loadingServ } = useServicosHorimetro();

  const dadosGrafico = useMemo(
    () => calcularPontosEficiencia(bulletins || [], servicos || []),
    [bulletins, servicos]
  );

  const isLoading = loadingBde && loadingServ;

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-xs text-gray-400">
        Calculando indicador de eficiência operacional...
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600" />
            Eficiência Operacional: Horas Pagas vs Horas Produzidas
          </h3>
          <p className="text-xs text-gray-500">
            Comparativo entre a jornada remunerada do operador e o horímetro efetivo da máquina
          </p>
        </div>
      </div>

      {dadosGrafico.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400">
          Nenhum apontamento com horário de jornada registrado nesta obra.
        </div>
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as PontoEficiencia;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                        <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1">{label}</p>
                        <p className="flex justify-between gap-4">
                          <span className="text-amber-400">Horas Pagas (Jornada):</span>
                          <b>{item.horasPagas}h</b>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-emerald-400">Horas Produzidas (Máq.):</span>
                          <b>{item.horasProduzidas}h</b>
                        </p>
                        <p className="flex justify-between gap-4 border-t border-slate-800 pt-1 text-rose-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Ociosidade:
                          </span>
                          <b>{item.ociosidadeHoras}h ({item.percentualOciosidade}%)</b>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar name="Horas Pagas (Jornada)" dataKey="horasPagas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar name="Horas Produzidas (Horímetro)" dataKey="horasProduzidas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
