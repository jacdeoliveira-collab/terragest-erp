import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { HealthCheckData } from '../types/master.types';

interface Props {
  healthData: HealthCheckData;
  tenantNome: string;
  tenantCnpj: string;
  totalTabelas: number;
}

export const MasterDatabaseParamsCard: React.FC<Props> = ({
  healthData,
  tenantNome,
  tenantCnpj,
  totalTabelas
}) => {
  return (
    <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-3">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span>Diagnóstico Estrutural & Parâmetros do Banco</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 space-y-1">
          <p className="font-semibold text-gray-300">Conexão & Endpoints Supabase</p>
          <p className="text-[11px] text-gray-400 font-mono truncate">Host: {healthData.supabaseUrl}</p>
          <p className="text-[11px] text-gray-400">Projeto: Postgres Cloud SaaS</p>
          <p className="text-[11px] text-emerald-400">Autenticação: Configurada (Anon Key)</p>
        </div>
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 space-y-1">
          <p className="font-semibold text-gray-300">Multi-Tenancy & Políticas RLS</p>
          <p className="text-[11px] text-gray-400">Tenant Ativo: {tenantNome}</p>
          <p className="text-[11px] text-gray-400">Documento: {tenantCnpj}</p>
          <p className="text-[11px] text-blue-400">Isolamento: Tenant ID (Row Level Security)</p>
        </div>
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 space-y-1">
          <p className="font-semibold text-gray-300">Status no Registro Remoto</p>
          <p className="text-[11px] text-gray-400">Registro na Nuvem: <span className="text-emerald-400">Localizado</span></p>
          <p className="text-[11px] text-gray-400">Status Contratual: <span className="text-emerald-400">ACTIVE</span></p>
          <p className="text-[11px] text-gray-400">Tabelas Ativas: <span className="text-white font-mono">{healthData.totalTabelasOnline} de {totalTabelas}</span></p>
        </div>
      </div>
    </div>
  );
};
