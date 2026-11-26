import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Crown, AlertCircle } from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { useGestaoBI } from '../hooks/useGestaoBI';
import { GestaoFiltrosBar } from '../components/features/gestao/GestaoFiltrosBar';
import { GestaoKpisGrid } from '../components/features/gestao/GestaoKpisGrid';
import { GestaoCustosChartCard } from '../components/features/gestao/GestaoCustosChartCard';
import { GestaoCruzamentoTabs } from '../components/features/gestao/GestaoCruzamentoTabs';
import { GestaoRadarOperacional } from '../components/features/gestao/GestaoRadarOperacional';

export const MobileGestaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivo, isMaster } = useTenantContext();
  const { resultado, filtros, atualizarFiltro, limparFiltros, isLoading, error, refetch } = useGestaoBI();

  const ehGratis = !isMaster && tenantAtivo?.plano === 'GRATIS';

  return (
    <div className="dark-surface min-h-full bg-[#14131c] text-slate-100 rounded-2xl p-3 sm:p-5 space-y-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Central de Gestão & BI</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Indicadores & Cruzamento de Dados</h1>
        </div>
        <span className="text-[11px] text-slate-400">Toque em qualquer card ou gráfico para abrir a origem</span>
      </div>

      {ehGratis ? (
        <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-8 flex flex-col items-center text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-indigo-400" />
          <h2 className="text-base font-bold text-white">BI & Cruzamento de Dados</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Acompanhe lucro por máquina, consumo L/h, inadimplência e produtividade por operador nos planos assinantes.
          </p>
          <button type="button" onClick={() => navigate('/planos')} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white cursor-pointer">
            <Crown className="w-4 h-4" /> Liberar Gestão Completa
          </button>
        </div>
      ) : (
        <>
          <GestaoFiltrosBar
            filtros={filtros}
            opcoes={resultado.opcoes}
            isLoading={isLoading}
            onChange={atualizarFiltro}
            onLimpar={limparFiltros}
            onRefresh={refetch}
          />

          {error && (
            <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <GestaoKpisGrid kpis={resultado.kpis} isLoading={isLoading} />
          <GestaoCustosChartCard kpis={resultado.kpis} isLoading={isLoading} />
          <GestaoCruzamentoTabs resultado={resultado} onCruzar={atualizarFiltro} />
          <GestaoRadarOperacional radar={resultado.radar} />
        </>
      )}
    </div>
  );
};
