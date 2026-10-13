import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Truck, ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import type { DashboardGlobalMetrics } from '../../../hooks/useDashboardGlobal';

interface DashboardCardsProps {
  metrics: DashboardGlobalMetrics;
  loading?: boolean;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {/* 1. Obra em Andamento */}
      <div
        onClick={() => navigate('/obras')}
        title="Clique para ir para Centros de Custo & Obras"
        className="p-4 bg-white border border-gray-200/90 hover:border-amber-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-amber-700 transition-colors">
            Obras em Andamento
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 transition-colors">
            <HardHat className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-gray-900">{metrics.obrasEmAndamento}</div>
        <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center justify-between">
          <span>Canteiros e contratos ativos</span>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
        </div>
      </div>

      {/* 2. Frotas Ativas */}
      <div
        onClick={() => navigate('/frota')}
        title="Clique para ver a Gestão de Frotas & Maquinário"
        className="p-4 bg-white border border-gray-200/90 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-emerald-700 transition-colors">
            Frotas Ativas
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-colors">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-gray-900">{metrics.frotasAtivas}</div>
        <div className="text-[11px] text-gray-500 font-medium mt-1 flex items-center justify-between">
          <span>De {metrics.totalEquipamentos} máquinas da frota</span>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>

      {/* 3. A Receber no Mês */}
      <div
        onClick={() => navigate('/financeiro?aba=receber')}
        title="Clique para ir para Contas a Receber (Medições)"
        className="p-4 bg-white border border-blue-200/80 hover:border-blue-500 bg-gradient-to-b from-blue-50/20 to-white rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide group-hover:text-blue-700">
            A Receber no Mês
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:bg-blue-100 transition-colors">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-blue-800">{formatBRL(metrics.aReceberNoMes)}</div>
        <div className="text-[11px] text-blue-700 font-medium mt-1 font-mono flex items-center justify-between">
          <span>+ {formatBRL(metrics.recebidoNoMes)} liquidado</span>
          <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-700 transition-colors" />
        </div>
      </div>

      {/* 4. A Pagar no Mês */}
      <div
        onClick={() => navigate('/financeiro?aba=pagar')}
        title="Clique para ir para Contas a Pagar (Despesas & Passivos)"
        className="p-4 bg-white border border-rose-200/80 hover:border-rose-500 bg-gradient-to-b from-rose-50/20 to-white rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide group-hover:text-rose-700">
            A Pagar no Mês
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 group-hover:bg-rose-100 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-rose-800">{formatBRL(metrics.aPagarNoMes)}</div>
        <div className="text-[11px] text-rose-700 font-medium mt-1 font-mono flex items-center justify-between">
          <span>+ {formatBRL(metrics.pagoNoMes)} despesas pagas</span>
          <ExternalLink className="w-3 h-3 text-rose-400 group-hover:text-rose-700 transition-colors" />
        </div>
      </div>
    </div>
  );
};
