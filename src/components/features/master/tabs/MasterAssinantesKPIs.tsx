import React from 'react';

interface MasterAssinantesKPIsProps {
  isLoading: boolean;
  totalTenants: number;
  ativos: number;
  pendentes: number;
  mrrTotal: number;
}

export const MasterAssinantesKPIs: React.FC<MasterAssinantesKPIsProps> = ({
  isLoading,
  totalTenants,
  ativos,
  pendentes,
  mrrTotal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-4 space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Tenants</span>
        <div className="text-2xl font-bold text-white">{isLoading ? '...' : totalTenants}</div>
        <p className="text-[11px] text-gray-400">Unidades de ERP isoladas</p>
      </div>
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-4 space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tenants Ativos</span>
        <div className="text-2xl font-bold text-emerald-400">{isLoading ? '...' : ativos}</div>
        <p className="text-[11px] text-gray-400">Com assinatura regular</p>
      </div>
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-4 space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aguardando Pagamento</span>
        <div className="text-2xl font-bold text-amber-400">{isLoading ? '...' : pendentes}</div>
        <p className="text-[11px] text-gray-400">Fluxo de onboarding</p>
      </div>
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-4 space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MRR SaaS Contratado</span>
        <div className="text-2xl font-bold text-white">
          {isLoading ? '...' : `R$ ${mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </div>
        <p className="text-[11px] text-gray-400">Faturamento mensal recorrente</p>
      </div>
    </div>
  );
};
