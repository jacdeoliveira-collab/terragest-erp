import { useState } from 'react';
import type { ModuleToggle, SystemFlag, WebhookLogItem, OnboardingItem } from '../types/master.types';

const INITIAL_MODULES: ModuleToggle[] = [
  { id: 'dash', nome: 'Dashboard Central & KPIs', planoMinimo: 'Plano Essencial', liberado: true, descricao: 'Indicadores executivos consolidados, contagem de OSs e visão rápida de banco.' },
  { id: 'cadastros', nome: 'Cadastro Base & Estruturas', planoMinimo: 'Plano Essencial', liberado: true, descricao: 'Fazendas, obras, operadores, tipos de serviços e equipamentos.' },
  { id: 'bde', nome: 'Apontamentos Diários & BDE', planoMinimo: 'Plano Essencial', liberado: true, descricao: 'Boletim Diário de Equipamento, produção por hora e assinaturas.' },
  { id: 'horimetro', nome: 'Horímetro & Medição de Serviços', planoMinimo: 'Plano Essencial', liberado: true, descricao: 'Abertura, execução e fechamento de serviços com controle de horímetro.' },
  { id: 'frota', nome: 'Frota, Máquinas & Oficina', planoMinimo: 'Plano Operacional', liberado: true, descricao: 'Controle de manutenções preventivas, corretivas e ordens de oficina.' },
  { id: 'almoxarifado', nome: 'Estoque & Almoxarifado', planoMinimo: 'Plano Operacional', liberado: true, descricao: 'Gestão multi-armazém, movimentações de peças com baixa via BDE.' },
  { id: 'diesel', nome: 'Diesel & Comboio', planoMinimo: 'Plano Operacional', liberado: true, descricao: 'Apontamento de abastecimentos móveis com validação de horímetro.' },
  { id: 'financeiro', nome: 'Financeiro & DAE Fiscal', planoMinimo: 'Plano Master', liberado: false, descricao: 'Contas a pagar/receber, conciliação e DAE automático por medição.' },
  { id: 'relatorios', nome: 'Relatórios & Exportações', planoMinimo: 'Plano Master', liberado: false, descricao: 'Exportação em Excel/CSV, auditoria geral e dashboards analíticos.' },
];

const INITIAL_FLAGS: SystemFlag[] = [
  { id: 'trava_climatica', nome: 'Trava Climática Estrita de Operação', descricao: 'Bloqueio de ordens e BDE se chuva intensa ou vento > 30 km/h.', ativado: true },
  { id: 'rastreabilidade_lotes', nome: 'Rastreabilidade Avançada de Combustível', descricao: 'Exige foto do cupom/bomba para conferência de litragem no comboio.', ativado: true },
  { id: 'assinatura_obrigatoria', nome: 'Validação Obrigatória do Encarregado', descricao: 'Impede fechamento de BDE sem assinatura digital do responsável.', ativado: false },
  { id: 'rls_estrito', nome: 'Auditoria de Modificações SaaS', descricao: 'Gera trilha de log detalhada a cada alteração em dados do tenant.', ativado: true },
];

export function useMasterGovernance() {
  const [modules, setModules] = useState<ModuleToggle[]>(INITIAL_MODULES);
  const [flags, setFlags] = useState<SystemFlag[]>(INITIAL_FLAGS);
  const [onboardings, setOnboardings] = useState<OnboardingItem[]>([
    {
      id: 'onb-1',
      empresa: 'Grupo Grãos & Terra MT',
      localizacao: 'Sorriso / MT',
      admin: 'Carlos Eduardo Silveira',
      email: 'carlos@graosterra.com.br',
      plano: 'Plano Operacional',
      valor: 'R$ 1.250,00/mês',
      status: 'AGUARDANDO',
      data: new Date().toLocaleDateString('pt-BR'),
    }
  ]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);

  const toggleModule = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, liberado: !m.liberado } : m)));
  };

  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, ativado: !f.ativado } : f)));
  };

  const aprovarOnboarding = (id: string) => {
    setOnboardings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'APROVADO' as const } : o))
    );
  };

  const registrarWebhookLog = (log: Omit<WebhookLogItem, 'id' | 'data'>) => {
    const novoLog: WebhookLogItem = {
      id: Math.random().toString(36).substring(7),
      data: new Date().toLocaleTimeString('pt-BR'),
      ...log,
    };
    setWebhookLogs((prev) => [novoLog, ...prev.slice(0, 9)]);
  };

  return {
    modules,
    toggleModule,
    flags,
    toggleFlag,
    onboardings,
    aprovarOnboarding,
    webhookLogs,
    registrarWebhookLog,
  };
}
