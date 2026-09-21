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

interface PontoEficiencia {
  data: string;
  horasPagas: number;
  horasProduzidas: number;
  ociosidadeHoras: number;
  percentualOciosidade: number;
}

export const EficienciaChart: React.FC = () => {
  const { data: bulletins, isLoading } = useBDE();

  const dadosGrafico = useMemo(() => {
    if (!bulletins || bulletins.length === 0) return [];

    const agrupado: Record<string, { pagas: number; produzidas: number }> = {};

    bulletins.forEach((b) => {
      if (!b.date) return;
      const partes = b.date.split('-');
      const dataLabel = partes.length === 3 ? `${partes[2]}/${partes[1]}` : b.date;

      if (!agrupado[dataLabel]) {
        agrupado[dataLabel] = { pagas: 0, produzidas: 0 };
      }

      // Horas Máquina
      const diffMaq = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
      const horasMaq = Math.max(0, isNaN(diffMaq) ? Number(b.total_hours) || 0 : diffMaq);
      agrupado[dataLabel].produzidas += horasMaq;

      // Horas Homem (Jornada)
      if (b.hora_inicio_jornada && b.hora_fim_jornada) {
        const [h1, m1] = b.hora_inicio_jornada.split(':').map(Number);
        const [h2, m2] = b.hora_fim_jornada.split(':').map(Number);
        const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
        agrupado[dataLabel].pagas += Math.max(0, Number((mins / 60).toFixed(1)));
      } else {
        agrupado[dataLabel].pagas += horasMaq;
      }
    });

    return Object.keys(agrupado).map((dt): PontoEficiencia => {
      const pagas = Number(agrupado[dt].pagas.toFixed(1));
      const produzidas = Number(agrupado[dt].produzidas.toFixed(1));
      const ociosidadeHoras = Math.max(0, Number((pagas - produzidas).toFixed(1)));
      const percentualOciosidade = pagas > 0 ? Number(((ociosidadeHoras / pagas) * 100).toFixed(1)) : 0;

      return {
        data: dt,
        horasPagas: pagas,
        horasProduzidas: produzidas,
        ociosidadeHoras,
        percentualOciosidade
      };
    });
  }, [bulletins]);

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
