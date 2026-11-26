import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { GestaoBIKpis } from '../../../types/gestaoBI.types';

interface Props { kpis: GestaoBIKpis; isLoading: boolean; }

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GestaoCustosChartCard: React.FC<Props> = ({ kpis, isLoading }) => {
  const navigate = useNavigate();
  const maxFin = Math.max(kpis.receitaTotal, kpis.custoTotal, kpis.receitaRecebida, kpis.custosPagos, 1);
  const totalCustos = Math.max(kpis.custoTotal, 1);

  const barrasFin = [
    { label: 'Receita Faturada', valor: kpis.receitaTotal, cor: 'bg-emerald-500', text: 'text-emerald-400', to: '/comercial' },
    { label: 'Total Recebido (Caixa)', valor: kpis.receitaRecebida, cor: 'bg-teal-400', text: 'text-teal-300', to: '/financeiro?aba=receber' },
    { label: 'Custos & Despesas', valor: kpis.custoTotal, cor: 'bg-rose-500', text: 'text-rose-400', to: '/financeiro?aba=pagar' },
    { label: 'Custos Pagos (Caixa)', valor: kpis.custosPagos, cor: 'bg-amber-500', text: 'text-amber-400', to: '/financeiro?aba=pagar' }
  ];

  const composicao = [
    { label: 'Combustível / Diesel', valor: kpis.custoDiesel, cor: 'bg-amber-500', to: '/abastecimento' },
    { label: 'Operadores (Comissão)', valor: kpis.custoOperadores, cor: 'bg-indigo-500', to: '/rh' },
    { label: 'Manutenção & Peças', valor: kpis.custoManutencao, cor: 'bg-rose-500', to: '/manutencao' },
    { label: 'Outras Despesas', valor: kpis.outrosCustos, cor: 'bg-slate-400', to: '/financeiro?aba=pagar' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Receita × Custo × Caixa</h2>
          <span className="text-[10px] text-slate-400">Toque na barra para abrir origem</span>
        </div>
        <div className="space-y-2.5">
          {barrasFin.map((b) => (
            <button key={b.label} type="button" onClick={() => navigate(b.to)} className="w-full text-left group cursor-pointer">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 group-hover:text-white inline-flex items-center gap-1">
                  {b.label} <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                </span>
                <span className={`font-bold font-mono ${b.text}`}>{isLoading ? '...' : fmt(b.valor)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${b.cor} transition-all`} style={{ width: `${Math.min(100, (b.valor / maxFin) * 100)}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#232130] border border-slate-700/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Composição dos Custos</h2>
          <span className="text-[10px] text-slate-400">Clique na categoria para detalhar</span>
        </div>
        <div className="space-y-2.5">
          {composicao.map((item) => {
            const pct = kpis.custoTotal > 0 ? (item.valor / totalCustos) * 100 : 0;
            return (
              <button key={item.label} type="button" onClick={() => navigate(item.to)} className="w-full text-left group cursor-pointer">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 group-hover:text-white inline-flex items-center gap-1">
                    {item.label} <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {isLoading ? '...' : `${fmt(item.valor)} (${pct.toFixed(0)}%)`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${item.cor} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
