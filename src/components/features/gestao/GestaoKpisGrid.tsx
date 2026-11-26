import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, Fuel, TrendingUp, Wallet, CircleDollarSign, Gauge } from 'lucide-react';
import type { GestaoBIKpis } from '../../../types/gestaoBI.types';

interface Props { kpis: GestaoBIKpis; isLoading: boolean; }

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GestaoKpisGrid: React.FC<Props> = ({ kpis, isLoading }) => {
  const navigate = useNavigate();

  const cards = [
    {
      label: 'Horas Trabalhadas',
      valor: isLoading ? '...' : `${kpis.horasTrabalhadas.toFixed(1)}h`,
      sub: `${kpis.qtdServicos} serviço(s) no recorte`,
      to: '/comercial',
      icon: Clock,
      cor: 'text-indigo-700'
    },
    {
      label: 'Receita / Hora',
      valor: isLoading ? '...' : `${fmt(kpis.receitaPorHora)}/h`,
      sub: `Faturado: ${fmt(kpis.receitaTotal)}`,
      to: '/comercial',
      icon: CircleDollarSign,
      cor: 'text-emerald-700'
    },
    {
      label: 'Custo Real / Hora',
      valor: isLoading ? '...' : `${fmt(kpis.custoPorHora)}/h`,
      sub: `Total: ${fmt(kpis.custoTotal)}`,
      to: '/financeiro?aba=pagar',
      icon: Gauge,
      cor: 'text-rose-600'
    },
    {
      label: 'Margem Líquida',
      valor: isLoading ? '...' : fmt(kpis.lucroLiquido),
      sub: `Margem: ${kpis.margemPercent.toFixed(1)}%`,
      to: '/financeiro?aba=dre',
      icon: TrendingUp,
      cor: kpis.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-600'
    },
    {
      label: 'Consumo Diesel',
      valor: isLoading ? '...' : `${kpis.litrosPorHora.toFixed(1)} L/h`,
      sub: `${kpis.litrosDiesel.toFixed(0)}L • ${fmt(kpis.custoDiesel)}`,
      to: '/abastecimento',
      icon: Fuel,
      cor: 'text-amber-700'
    },
    {
      label: 'Saldo a Receber',
      valor: isLoading ? '...' : fmt(kpis.saldoAReceber),
      sub: `Recebido: ${fmt(kpis.receitaRecebida)}`,
      to: '/financeiro?aba=receber',
      icon: Wallet,
      cor: kpis.saldoAReceber > 0 ? 'text-amber-700' : 'text-emerald-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => navigate(c.to)}
            title={`Abrir origem: ${c.label}`}
            className="group rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500/60 shadow-xs p-3.5 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <Icon className={`w-4 h-4 ${c.cor}`} />
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-600">{c.label}</p>
            <p className={`mt-0.5 text-sm sm:text-base font-extrabold truncate ${c.cor}`}>{c.valor}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 truncate">{c.sub}</p>
          </button>
        );
      })}
    </div>
  );
};
