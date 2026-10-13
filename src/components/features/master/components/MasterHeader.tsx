import React from 'react';
import { Activity, Users, Layers, Webhook, Flag, Database } from 'lucide-react';
import type { MasterTab } from '../types/master.types';

interface MasterHeaderProps {
  activeTab: MasterTab;
  onTabChange: (tab: MasterTab) => void;
  totalTenants: number;
  totalOnboardings: number;
  supabaseStatus: 'operacional' | 'lento' | 'offline';
  tenantAtivoNome?: string;
  tenantAtivoCnpj?: string;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  activeTab,
  onTabChange,
  totalTenants,
  totalOnboardings,
  supabaseStatus,
  tenantAtivoNome = 'TerraGest Matriz',
  tenantAtivoCnpj = '00.000.000/0001-00',
}) => {
  const tabs = [
    { id: 'banco', label: 'Banco & Health Check', icone: Database },
    { id: 'assinantes', label: `Assinantes (${totalTenants})`, icone: Users },
    { id: 'planos', label: 'Matriz de Planos & Toggles', icone: Layers },
    { id: 'webhooks', label: `Onboarding & Webhooks (${totalOnboardings})`, icone: Webhook },
    { id: 'flags', label: 'Flags de Sistema', icone: Flag },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Box Superior Principal */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 shadow-lg text-left">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-md">
                Super Admin Master Global
              </span>
              <span className="text-xs text-gray-400">
                operador: <span className="text-gray-300 font-mono">agrodronesconsultoria@gmail.com</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Central Master de Governança SaaS & Multi-Tenancy
            </h1>
            <p className="text-xs text-gray-400 max-w-3xl">
              Controle de clientes, planos contratuais, Feature Toggles dinâmicos e fluxo de ativação automatizado via Webhook.
            </p>
          </div>

          {/* Abas Superiores no estilo Dark / Pill */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0d12] p-1.5 rounded-lg border border-[#21262d]">
            {tabs.map((tab) => {
              const Icon = tab.icone;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as MasterTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md font-bold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Faixa de Status Rápido */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-lg px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              supabaseStatus === 'operacional'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : supabaseStatus === 'lento'
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
          />
          <span className="font-semibold text-gray-200">Database Health:</span>
          <span className="text-emerald-400 font-mono">
            {supabaseStatus === 'operacional' ? 'Supabase Online' : supabaseStatus === 'lento' ? 'Latência Elevada' : 'Offline'}
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="text-gray-400 hidden sm:inline">Tenant Ativo:</span>
          <span className="text-white font-medium hidden sm:inline">{tenantAtivoNome}</span>
          <span className="text-gray-500 font-mono text-[11px] hidden md:inline">({tenantAtivoCnpj})</span>
        </div>

        <button
          onClick={() => onTabChange('banco')}
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors text-left sm:text-right"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Ver Diagnóstico de Conexão, Latência & Sync</span>
        </button>
      </div>
    </div>
  );
};
