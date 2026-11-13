import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Calendar, CalendarPlus, CircleDollarSign, ClipboardList,
  Eye, EyeOff, Fuel, HardHat, Lock, Truck, Wallet
} from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { useDashboardGlobal } from '../hooks/useDashboardGlobal';
import { temAcessoModuloPorPlano } from '../utils/planosCatalogo';

const CARDS = [
  { label: 'Pedidos / Horímetro', to: '/comercial', icon: ClipboardList, bg: 'bg-indigo-500/20 text-indigo-300' },
  { label: 'Agenda', to: '/agenda', icon: Calendar, bg: 'bg-cyan-500/20 text-cyan-300' },
  { label: 'Financeiro', to: '/financeiro', icon: CircleDollarSign, bg: 'bg-emerald-500/20 text-emerald-300' },
  { label: 'Clientes & Obras', to: '/obras', icon: HardHat, bg: 'bg-amber-500/20 text-amber-300' },
  { label: 'Almoxarifado', to: '/almoxarifado', icon: Boxes, bg: 'bg-sky-500/20 text-sky-300' },
  { label: 'Frota & Serviços', to: '/frota', icon: Truck, bg: 'bg-blue-500/20 text-blue-300' }
];

const ATALHOS = [
  { label: 'Criar novo pedido', to: '/comercial', icon: ClipboardList, bg: 'bg-indigo-500/20 text-indigo-300' },
  { label: 'Novo recebimento', to: '/financeiro?aba=receber', icon: Wallet, bg: 'bg-emerald-500/20 text-emerald-300' },
  { label: 'Novo compromisso', to: '/agenda', icon: CalendarPlus, bg: 'bg-cyan-500/20 text-cyan-300' },
  { label: 'Abastecimento', to: '/abastecimento', icon: Fuel, bg: 'bg-amber-500/20 text-amber-300' }
];

export const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivo, isMaster } = useTenantContext();
  const { metrics } = useDashboardGlobal();
  const [ocultarValores, setOcultarValores] = useState(false);

  const fmt = (v: number) =>
    ocultarValores ? '••••••' : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-full bg-[#14131c] text-slate-100 rounded-2xl p-4 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const bloqueado = !temAcessoModuloPorPlano(tenantAtivo?.plano, card.to, isMaster);
          return (
            <button
              key={card.to}
              type="button"
              onClick={() => navigate(card.to)}
              className="relative flex flex-col items-start gap-3 rounded-2xl bg-[#232130] border border-slate-700/60 p-4 text-left active:scale-[0.98] transition-all"
            >
              {bloqueado && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-slate-100 leading-tight">{card.label}</span>
            </button>
          );
        })}
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">Atalhos</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {ATALHOS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className="min-w-[116px] shrink-0 flex flex-col items-start gap-2.5 rounded-2xl bg-[#232130] border border-slate-700/60 p-3.5 text-left active:scale-[0.98]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-200 leading-snug">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">Resumo do Mês</h2>
          <button
            type="button"
            onClick={() => setOcultarValores((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Alternar visibilidade dos valores"
          >
            {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-[#232130] border border-slate-700/60 p-3.5">
          <div>
            <p className="text-[10px] text-slate-400">Receitas</p>
            <p className="mt-0.5 text-xs font-bold text-emerald-400 truncate">{fmt(metrics.totalReceitasMes)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Despesas</p>
            <p className="mt-0.5 text-xs font-bold text-rose-400 truncate">{fmt(metrics.totalDespesasMes)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Saldo</p>
            <p className="mt-0.5 text-xs font-bold text-indigo-300 truncate">{fmt(metrics.saldoProjetado)}</p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => navigate('/comercial')}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/50 active:scale-[0.99] transition-all"
      >
        <ClipboardList className="w-4 h-4" />
        <span>Criar novo pedido</span>
      </button>
    </div>
  );
};

