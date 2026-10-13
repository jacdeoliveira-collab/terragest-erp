export type MasterTab = 'banco' | 'assinantes' | 'planos' | 'webhooks' | 'flags';

export interface TableInventoryItem {
  id: string;
  nome: string;
  tabela: string;
  contagem: number | null;
  status: 'online' | 'vazio' | 'erro';
}

export interface HealthCheckData {
  status: 'operacional' | 'lento' | 'offline';
  latenciaMs: number | null;
  timestamp: string;
  supabaseUrl: string;
  totalTabelasOnline: number;
}

export interface OnboardingItem {
  id: string;
  empresa: string;
  localizacao: string;
  admin: string;
  email: string;
  plano: string;
  valor: string;
  status: 'AGUARDANDO' | 'APROVADO';
  data: string;
}

export interface WebhookLogItem {
  id: string;
  gateway: string;
  evento: string;
  status: 'sucesso' | 'falha';
  data: string;
  resposta: string;
}

export interface PlanoInfo {
  id: 'START' | 'PRO' | 'ENTERPRISE';
  nome: string;
  preco: string;
  limiteMaquinas: string;
  recursos: string[];
  destaque?: boolean;
}

export interface ModuleToggle {
  id: string;
  nome: string;
  planoMinimo: string;
  liberado: boolean;
  descricao: string;
}

export interface SystemFlag {
  id: string;
  nome: string;
  descricao: string;
  ativado: boolean;
}
