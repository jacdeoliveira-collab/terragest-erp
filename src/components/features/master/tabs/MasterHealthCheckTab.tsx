import React from 'react';
import { Activity, Play, RefreshCw } from 'lucide-react';
import { TableInventoryGrid } from '../components/TableInventoryGrid';
import { SyncGuideSection } from '../components/SyncGuideSection';
import { MasterDatabaseParamsCard } from '../components/MasterDatabaseParamsCard';
import type { HealthCheckData, TableInventoryItem } from '../types/master.types';

interface MasterHealthCheckTabProps {
  healthData: HealthCheckData;
  inventario: TableInventoryItem[];
  isLoading: boolean;
  isAuto: boolean;
  onToggleAuto: () => void;
  onExecutarCheck: () => void;
  tenantNome?: string;
  tenantCnpj?: string;
}

export const MasterHealthCheckTab: React.FC<MasterHealthCheckTabProps> = ({
  healthData,
  inventario,
  isLoading,
  isAuto,
  onToggleAuto,
  onExecutarCheck,
  tenantNome = 'TerraGest Construtora',
  tenantCnpj = '00.000.000/0001-00',
}) => {
  const isOnline = healthData.status !== 'offline';
  const latencia = healthData.latenciaMs ?? 0;
  const latenciaClass = latencia > 900 ? 'text-amber-400' : latencia > 400 ? 'text-blue-400' : 'text-emerald-400';
  const latenciaTag = latencia > 900 ? 'ALTA LATÊNCIA' : latencia > 400 ? 'LATÊNCIA MÉDIA' : 'BAIXA LATÊNCIA';

  return (
    <div className="space-y-4 text-left">
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Database Health Check</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                {isOnline ? 'Operacional / Ping Ativo' : 'Offline / Erro'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Diagnóstico em tempo real da conectividade e tempo de resposta.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAuto}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isAuto ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-[#161b22] text-gray-400 border-[#30363d]'
              }`}
            >
              <span>Auto (10s)</span>
              <span className={`px-1 rounded text-[10px] ${isAuto ? 'bg-amber-400 text-black font-bold' : 'bg-gray-800'}`}>
                {isAuto ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={onExecutarCheck}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-3 h-3 fill-current ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Verificando...' : 'Executar Health Check'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">1. Conectividade Supabase</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white">Conectado & Operacional</span>
            </div>
            <p className="text-[11px] text-gray-400">Supabase conectado e tabelas respondendo perfeitamente.</p>
          </div>

          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2. Latência da Conexão (Ping)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${latenciaClass} border-current/30`}>
                {latenciaTag}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono tracking-tight ${latenciaClass}`}>
                {isLoading ? '...' : `${latencia} ms`}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${latencia > 900 ? 'bg-amber-400 w-4/5' : latencia > 400 ? 'bg-blue-400 w-1/2' : 'bg-emerald-400 w-1/4'}`}
              />
            </div>
            <p className="text-[10px] text-gray-500">Última Checagem: {healthData.timestamp}</p>
          </div>

          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">3. Tenant Ativo & Sincronização</span>
            <div className="text-sm font-bold text-white truncate">{tenantNome}</div>
            <p className="text-[11px] text-gray-400">Documento: {tenantCnpj}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={onExecutarCheck}
                className="w-full py-1 text-center bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 text-xs font-medium rounded border border-[#30363d] transition-all flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Sincronizar Banco</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MasterDatabaseParamsCard
        healthData={healthData}
        tenantNome={tenantNome}
        tenantCnpj={tenantCnpj}
        totalTabelas={inventario.length}
      />

      <SyncGuideSection onPushLocalData={onExecutarCheck} />
      <TableInventoryGrid inventario={inventario} isLoading={isLoading} onRefresh={onExecutarCheck} />
    </div>
  );
};
