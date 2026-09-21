import React from 'react';
import { Truck, Users, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { KpiCard } from '../../dashboard/KpiCard';
import type { DashboardMetrics } from '../../../types/dashboard.types';

interface KpiDashboardGridProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

export const KpiDashboardGrid: React.FC<KpiDashboardGridProps> = ({ metrics, loading }) => {
  const alertaCritico = metrics.manutencoesAtrasadas > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        titulo="Máquinas Ativas"
        valor={loading ? '...' : `${metrics.maquinasAtivas} de ${metrics.totalMaquinas}`}
        subtitulo="Disponíveis ou em operação"
        icone={<Truck className="w-5 h-5" />}
        corDestaque="blue"
      />
      <KpiCard
        titulo="Operadores Ativos"
        valor={loading ? '...' : metrics.operadoresAtivos}
        subtitulo="Quadro operacional ativo"
        icone={<Users className="w-5 h-5" />}
        corDestaque="emerald"
      />
      <KpiCard
        titulo="Combustível (Mês Atual)"
        valor={loading ? '...' : metrics.custoCombustivelFormatado}
        subtitulo={loading ? '...' : `${metrics.litrosConsumidos.toFixed(1)} L de diesel consumidos`}
        icone={<CircleDollarSign className="w-5 h-5" />}
        corDestaque="amber"
      />
      <KpiCard
        titulo="Alertas Críticos"
        valor={loading ? '...' : metrics.manutencoesAtrasadas}
        subtitulo={alertaCritico ? 'Revisões preventivas vencidas' : 'Todas as revisões em dia'}
        icone={<AlertTriangle className="w-5 h-5" />}
        corDestaque={alertaCritico ? 'rose' : 'emerald'}
      />
    </div>
  );
};
