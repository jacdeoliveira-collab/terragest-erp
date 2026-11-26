import { useState } from 'react';
import type { ModuleToggle, SystemFlag, WebhookLogItem, OnboardingItem } from '../types/master.types';

export function useMasterGovernance() {
  const [modules, setModules] = useState<ModuleToggle[]>([]);
  const [flags, setFlags] = useState<SystemFlag[]>([]);
  const [onboardings, setOnboardings] = useState<OnboardingItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);

  const toggleModule = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, liberado: !m.liberado } : m)));
  };

  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, ativado: !f.ativado } : f)));
  };

  const aprovarOnboarding = (id: string) => {
    setOnboardings((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'APROVADO' as const } : o)));
  };

  const registrarWebhookLog = (log: Omit<WebhookLogItem, 'id' | 'data'>) => {
    const novoLog: WebhookLogItem = {
      id: Math.random().toString(36).substring(7),
      data: new Date().toLocaleTimeString('pt-BR'),
      ...log
    };
    setWebhookLogs((prev) => [novoLog, ...prev.slice(0, 19)]);
  };

  return {
    modules,
    flags,
    onboardings,
    webhookLogs,
    toggleModule,
    toggleFlag,
    aprovarOnboarding,
    registrarWebhookLog
  };
}
