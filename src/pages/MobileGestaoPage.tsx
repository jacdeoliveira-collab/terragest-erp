import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Crown, HardHat, Truck } from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { useDashboardGlobal } from '../hooks/useDashboardGlobal';

export const MobileGestaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivo, isMaster } = useTenantContext();
  const { metrics, isLoading } = useDashboardGlobal();

  const ehGratis = !isMaster && tenantAtivo?.plano === 'GRATIS';
  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const maxPrevisto = Math.max(metrics.totalReceitasMes, metrics.totalDespesasMes, 1);
  const maxRealizado = Math.max(metrics.recebidoNoMes, metrics.pagoNoMes, 1);

  return (
    <div className="min-h-full bg-[#14131c] text-slate-100 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-[#232130] border border-slate-700/60 px-4 py-3">
        <span className="text-xs text-slate-400">
          Você tá vendo: <strong className="text-white">Mês Atual ({metrics.mesAtual})</strong>
        </span>
        <BarChart3 className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-4">
        <h2 className="text-base font-bold text-white">Receita x Custo</h2>
        {ehGratis ? (
          <div className="flex flex-col items-center py-6 text-center space-y-3">
            <BarChart3 className="w-10 h-10 text-slate-500" />
            <p className="text-xs text-slate-400">Disponível nos planos Start, Pro e Enterprise</p>
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white"
            >
              <Crown className="w-3.5 h-3.5" /> Liberar Gestão
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Receitas do Mês</span>
                <span className="font-bold text-emerald-400">{isLoading ? '...' : fmt(metrics.totalReceitasMes)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.totalReceitasMes / maxPrevisto) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Custos & Despesas</span>
                <span className="font-bold text-rose-400">{isLoading ? '...' : fmt(metrics.totalDespesasMes)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(metrics.totalDespesasMes / maxPrevisto) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-4">
        <h2 className="text-base font-bold text-white">Recebido x Custos pagos</h2>
        {ehGratis ? (
          <p className="text-xs text-slate-400 py-4 text-center">Faça upgrade para acompanhar o fluxo de caixa realizado.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Total Recebido</span>
                <span className="font-bold text-emerald-400">{isLoading ? '...' : fmt(metrics.recebidoNoMes)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.recebidoNoMes / maxRealizado) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Custos Pagos</span>
                <span className="font-bold text-amber-400">{isLoading ? '...' : fmt(metrics.pagoNoMes)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(metrics.pagoNoMes / maxRealizado) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 flex items-center gap-3">
          <HardHat className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400">Obras Ativas</p>
            <p className="text-lg font-bold text-white">{metrics.obrasEmAndamento}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 flex items-center gap-3">
          <Truck className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400">Máquinas</p>
            <p className="text-lg font-bold text-white">{metrics.frotasAtivas}/{metrics.totalEquipamentos}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

