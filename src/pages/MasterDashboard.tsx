import React, { useState } from 'react';
import { useMasterTenants } from '../hooks/useMasterTenants';
import { useMasterHealthCheck } from '../components/features/master/hooks/useMasterHealthCheck';
import { useMasterGovernance } from '../components/features/master/hooks/useMasterGovernance';
import { MasterHeader } from '../components/features/master/components/MasterHeader';
import { MasterHealthCheckTab } from '../components/features/master/tabs/MasterHealthCheckTab';
import { MasterAssinantesTab } from '../components/features/master/tabs/MasterAssinantesTab';
import { MasterPlanosTogglesTab } from '../components/features/master/tabs/MasterPlanosTogglesTab';
import { MasterWebhooksTab } from '../components/features/master/tabs/MasterWebhooksTab';
import { MasterFlagsTab } from '../components/features/master/tabs/MasterFlagsTab';
import type { MasterTab } from '../components/features/master/types/master.types';

export const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MasterTab>('banco');

  const {
    tenants,
    isLoading: isLoadingTenants,
    alternarStatusConta,
    atualizarTenant,
    criarTenant,
  } = useMasterTenants();

  const {
    healthData,
    inventario,
    isLoading: isCheckingHealth,
    isAuto,
    setIsAuto,
    executarHealthCheck,
  } = useMasterHealthCheck();

  const {
    modules,
    toggleModule,
    flags,
    toggleFlag,
    onboardings,
    aprovarOnboarding,
    webhookLogs,
    registrarWebhookLog,
  } = useMasterGovernance();

  const tenantAtivo = tenants[0];

  return (
    <div className="space-y-5 text-left pb-10">
      {/* Cabeçalho Escuro Master com Badges, Operador e Abas */}
      <MasterHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalTenants={tenants.length}
        totalOnboardings={onboardings.filter((o) => o.status === 'AGUARDANDO').length}
        supabaseStatus={healthData.status}
        tenantAtivoNome={tenantAtivo?.nome || 'TerraGest Matriz'}
        tenantAtivoCnpj={tenantAtivo?.cnpj || '00.000.000/0001-00'}
      />

      {/* Conteúdo Dinâmico da Aba Selecionada */}
      {activeTab === 'banco' && (
        <MasterHealthCheckTab
          healthData={healthData}
          inventario={inventario}
          isLoading={isCheckingHealth}
          isAuto={isAuto}
          onToggleAuto={() => setIsAuto(!isAuto)}
          onExecutarCheck={executarHealthCheck}
          tenantNome={tenantAtivo?.nome}
          tenantCnpj={tenantAtivo?.cnpj}
        />
      )}

      {activeTab === 'assinantes' && (
        <MasterAssinantesTab
          tenants={tenants}
          isLoading={isLoadingTenants}
          onToggleStatus={alternarStatusConta}
          onUpdate={atualizarTenant}
          onCreate={criarTenant}
        />
      )}

      {activeTab === 'planos' && (
        <MasterPlanosTogglesTab
          tenants={tenants}
          modules={modules}
          onToggleModule={toggleModule}
          onUpdateTenant={atualizarTenant}
        />
      )}

      {activeTab === 'webhooks' && (
        <MasterWebhooksTab
          onboardings={onboardings}
          webhookLogs={webhookLogs}
          onAprovarOnboarding={aprovarOnboarding}
          onDispararWebhook={registrarWebhookLog}
        />
      )}

      {activeTab === 'flags' && (
        <MasterFlagsTab flags={flags} onToggleFlag={toggleFlag} />
      )}
    </div>
  );
};

export default MasterDashboard;
