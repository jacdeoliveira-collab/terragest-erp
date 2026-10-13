import React from 'react';
import { Truck, Users, CircleDollarSign, AlertTriangle, DollarSign, Wallet } from 'lucide-react';
import { KpiCard } from '../../dashboard/KpiCard';
import type { DashboardMetrics } from '../../../types/dashboard.types';

interface KpiDashboardGridProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

const formatarBRL = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const KpiDashboardGrid: React.FC<KpiDashboardGridProps> = ({ metrics, loading }) => {
  const alertaCritico = metrics.manutencoesAtrasadas > 0;

  return (
    <div className="space-y-4">
      {/* Cards Financeiros & Comerciais (Pipeline Start) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          titulo="Faturamento Aprovado"
          valor={loading ? '...' : formatarBRL(metrics.faturamentoAprovado)}
          subtitulo="Locações e serviços aprovados/concluídos"
          icone={<DollarSign className="w-5 h-5" />}
          corDestaque="emerald"
        />
        <KpiCard
          titulo="Pipeline Pendente"
          valor={loading ? '...' : formatarBRL(metrics.valorPendente)}
          subtitulo={`${metrics.propostasPendentesCount} proposta(s) aguardando aprovação`}
          icone={<Wallet className="w-5 h-5" />}
          corDestaque="amber"
        />
        <KpiCard
          titulo="Diesel & Combustível"
          valor={loading ? '...' : metrics.custoCombustivelFormatado}
          subtitulo={loading ? '...' : `${metrics.litrosConsumidos.toFixed(1)} L de diesel consumidos`}
          icone={<CircleDollarSign className="w-5 h-5" />}
          corDestaque="amber"
        />
      </div>

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          titulo="Alertas Críticos"
          valor={loading ? '...' : metrics.manutencoesAtrasadas}
          subtitulo={alertaCritico ? 'Revisões preventivas vencidas' : 'Todas as revisões em dia'}
          icone={<AlertTriangle className="w-5 h-5" />}
          corDestaque={alertaCritico ? 'rose' : 'emerald'}
        />
      </div>
    </div>
  );
};

