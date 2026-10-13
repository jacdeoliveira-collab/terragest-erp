import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CircleDollarSign, Building2, ReceiptText, Landmark } from 'lucide-react';
import { ContasPagar } from './ContasPagar';
import { ContasReceber } from './ContasReceber';
import { CentrosCustoTab } from '../components/features/financeiro/CentrosCustoTab';
import { MedicoesList } from '../components/features/faturamento/MedicoesList';
import { ContasBancariasTab } from '../components/features/financeiro/ContasBancariasTab';
import { FinanceiroAlertasBanner } from '../components/features/financeiro/FinanceiroAlertasBanner';

export type FinanceiroTab = 'pagar' | 'receber' | 'centros-custo' | 'faturamento' | 'contas';

const TABS: Array<{ id: FinanceiroTab; label: string; icon: React.ElementType }> = [
  { id: 'pagar', label: 'Contas a Pagar', icon: CreditCard },
  { id: 'receber', label: 'Contas a Receber', icon: CircleDollarSign },
  { id: 'contas', label: 'Contas Bancárias & Pix', icon: Landmark },
  { id: 'centros-custo', label: 'Centros de Custo & DRE', icon: Building2 },
  { id: 'faturamento', label: 'Medição & Faturamento', icon: ReceiptText }
];

export const Financeiro: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('aba') as FinanceiroTab) || 'pagar';

  const setTab = (tab: FinanceiroTab) => {
    setSearchParams({ aba: tab }, { replace: true });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão Financeira</h1>
          <p className="text-xs text-gray-500">
            Contas a pagar, contas a receber, contas bancárias/Pix, faturamento e centros de custo
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/80 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-700 shadow-xs border border-gray-200/60 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Alertas Inteligentes de Vencimento */}
      <FinanceiroAlertasBanner onNavegarTab={(tab) => setTab(tab)} />

      {/* Conteúdo da Aba */}
      <div>
        {currentTab === 'pagar' && <ContasPagar />}
        {currentTab === 'receber' && <ContasReceber />}
        {currentTab === 'contas' && <ContasBancariasTab />}
        {currentTab === 'centros-custo' && <CentrosCustoTab />}
        {currentTab === 'faturamento' && <MedicoesList />}
      </div>
    </div>
  );
};

export default Financeiro;
