import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';
import type { TenantMaster, TipoPlanoTenant, UpdateTenantDTO } from '../../../../types/tenant.types';
import type { ModuleToggle } from '../types/master.types';
import { MasterPlanosCardsGrid } from './MasterPlanosCardsGrid';

interface MasterPlanosTogglesTabProps {
  tenants: TenantMaster[];
  modules: ModuleToggle[];
  onToggleModule: (id: string) => void;
  onUpdateTenant: (id: string, payload: UpdateTenantDTO) => Promise<{ success: boolean }>;
}

export const MasterPlanosTogglesTab: React.FC<MasterPlanosTogglesTabProps> = ({
  tenants,
  modules,
  onToggleModule,
  onUpdateTenant,
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  const planoAtual = (selectedTenant?.plano as TipoPlanoTenant) || 'START';

  const handleMudarPlano = async (novoPlano: TipoPlanoTenant) => {
    if (!selectedTenant) return;
    const preco = novoPlano === 'START' ? 499 : novoPlano === 'PRO' ? 1250 : 2500;
    await onUpdateTenant(selectedTenant.id, {
      plano: novoPlano,
      plano_valor: preco,
      valor_mensalidade: preco,
    });
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header com Seletor do Tenant */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Matriz de Permissões & Overrides por Cliente</span>
            </h3>
            <p className="text-[11px] text-gray-400">Define exceções individuais (Feature Toggles) para liberar ou bloquear módulos específicos.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Cliente:</span>
            <select
              value={selectedTenant?.id || ''}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] text-white rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.plano || 'START'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de 3 Planos SaaS */}
        <MasterPlanosCardsGrid
          planoAtual={planoAtual}
          onSelectPlano={handleMudarPlano}
        />
      </div>

      {/* Seção de Módulos Individuais com Toggle Switches */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Módulos para: <span className="text-amber-400">{selectedTenant?.nome || 'Cliente Selecionado'}</span>
          </h3>
          <p className="text-[11px] text-gray-400">Alterne para forçar a liberação ou bloqueio individual de cada módulo.</p>
        </div>

        <div className="space-y-2">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 flex items-center justify-between gap-4 hover:border-[#30363d] transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{mod.nome}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    Requer: {mod.planoMinimo}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{mod.descricao}</p>
              </div>

              <button
                onClick={() => onToggleModule(mod.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all border ${
                  mod.liberado
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-gray-800/40 text-gray-400 border-gray-700'
                }`}
              >
                {mod.liberado ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Liberado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span>Bloqueado</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
