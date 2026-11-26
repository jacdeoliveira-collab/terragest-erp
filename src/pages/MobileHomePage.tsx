import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Calendar, CalendarPlus, CircleDollarSign, ClipboardList,
  Eye, EyeOff, Fuel, Lock, Truck, Users, Wallet
} from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { usePlanosContext } from '../contexts/PlanosContext';
import { useDashboardGlobal } from '../hooks/useDashboardGlobal';

const CARDS = [
  { label: 'Pedidos / Horímetro', to: '/comercial', icon: ClipboardList, bg: 'bg-indigo-50 text-indigo-700' },
  { label: 'Agenda', to: '/agenda', icon: Calendar, bg: 'bg-blue-50 text-blue-700' },
  { label: 'Financeiro', to: '/financeiro', icon: CircleDollarSign, bg: 'bg-emerald-50 text-emerald-700' },
  { label: 'Clientes', to: '/clientes', icon: Users, bg: 'bg-amber-50 text-amber-700' },
  { label: 'Almoxarifado', to: '/almoxarifado', icon: Boxes, bg: 'bg-blue-50 text-blue-700' },
  { label: 'Frota & Serviços', to: '/frota', icon: Truck, bg: 'bg-indigo-50 text-indigo-700' }
];

const ATALHOS = [
  { label: 'Criar novo pedido', to: '/comercial', icon: ClipboardList, bg: 'bg-indigo-50 text-indigo-700' },
  { label: 'Novo recebimento', to: '/financeiro?aba=receber', icon: Wallet, bg: 'bg-emerald-50 text-emerald-700' },
  { label: 'Novo compromisso', to: '/agenda', icon: CalendarPlus, bg: 'bg-blue-50 text-blue-700' },
  { label: 'Abastecimento', to: '/abastecimento', icon: Fuel, bg: 'bg-amber-50 text-amber-700' }
];

export const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivo, isMaster } = useTenantContext();
  const { temAcessoModulo } = usePlanosContext();
  const { metrics } = useDashboardGlobal();
  const [ocultarValores, setOcultarValores] = useState(false);

  const fmt = (v: number) =>
    ocultarValores ? '••••••' : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-full space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const bloqueado = !temAcessoModulo(tenantAtivo?.plano, card.to, isMaster);
          return (
            <button
              key={card.to}
              type="button"
              onClick={() => navigate(card.to)}
              className="relative flex flex-col items-start gap-3 rounded-2xl bg-white border border-slate-200 shadow-xs p-4 text-left active:scale-[0.98] transition-all cursor-pointer"
            >
              {bloqueado && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 leading-tight">{card.label}</span>
            </button>
          );
        })}
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-600">Atalhos</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {ATALHOS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className="min-w-[116px] shrink-0 flex flex-col items-start gap-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs p-3.5 text-left active:scale-[0.98] cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800 leading-snug">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-600">Resumo do Mês</h2>
          <button
            type="button"
            onClick={() => setOcultarValores((v) => !v)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
            aria-label="Alternar visibilidade dos valores"
          >
            {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs p-3">
          <button type="button" onClick={() => navigate('/financeiro?aba=receber')} className="text-left rounded-xl p-1.5 hover:bg-slate-50 transition-colors cursor-pointer">
            <p className="text-[10px] font-medium text-slate-500">Receitas ↗</p>
            <p className="mt-0.5 text-xs font-bold text-emerald-700 truncate">{fmt(metrics.totalReceitasMes)}</p>
          </button>
          <button type="button" onClick={() => navigate('/financeiro?aba=pagar')} className="text-left rounded-xl p-1.5 hover:bg-slate-50 transition-colors cursor-pointer">
            <p className="text-[10px] font-medium text-slate-500">Despesas ↗</p>
            <p className="mt-0.5 text-xs font-bold text-rose-600 truncate">{fmt(metrics.totalDespesasMes)}</p>
          </button>
          <button type="button" onClick={() => navigate('/gestao')} className="text-left rounded-xl p-1.5 hover:bg-slate-50 transition-colors cursor-pointer">
            <p className="text-[10px] font-medium text-slate-500">Saldo ↗</p>
            <p className="mt-0.5 text-xs font-bold text-indigo-700 truncate">{fmt(metrics.saldoProjetado)}</p>
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={() => navigate('/comercial')}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.99] transition-all cursor-pointer"
      >
        <ClipboardList className="w-4 h-4" />
        <span>Criar novo pedido</span>
      </button>
    </div>
  );
};
