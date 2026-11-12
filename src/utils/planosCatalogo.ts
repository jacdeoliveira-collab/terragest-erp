import type { TipoPlanoTenant } from '../types/tenant.types';

export interface PlanoCatalogoItem {
  id: TipoPlanoTenant;
  nome: string;
  preco: number;
  subtitulo: string;
  destaque?: boolean;
  limiteUsuarios: number;
  recursos: string[];
}

export const PLANOS_CATALOGO: PlanoCatalogoItem[] = [
  {
    id: 'GRATIS',
    nome: 'Grátis',
    preco: 0,
    subtitulo: 'Vitrine inicial para organizar sua agenda',
    limiteUsuarios: 2,
    recursos: [
      'Agenda de Máquinas e Serviços',
      'Cadastro de Clientes',
      'Dados da Minha Empresa',
      'Suporte direto via WhatsApp'
    ]
  },
  {
    id: 'START',
    nome: 'Start',
    preco: 499,
    subtitulo: 'Controle operacional de campo e frotas',
    limiteUsuarios: 5,
    recursos: [
      'Tudo do plano Grátis',
      'Serviços por Horímetro & Medições PDF',
      'Gestão de Frotas, Abastecimento e Manutenção',
      'Boletins Diários (BDE) e Checklists'
    ]
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 1250,
    subtitulo: 'Gestão financeira completa + Asaas',
    destaque: true,
    limiteUsuarios: 15,
    recursos: [
      'Tudo do plano Start',
      'Financeiro, Contas a Pagar e Receber',
      'Cobrança PIX e Boleto Asaas para Clientes',
      'RH, Operadores e Obras / Centros de Custo'
    ]
  },
  {
    id: 'ENTERPRISE',
    nome: 'Enterprise',
    preco: 2500,
    subtitulo: 'Operação pesada multi-obras sem limites',
    limiteUsuarios: 99,
    recursos: [
      'Todos os módulos liberados',
      'Almoxarifado, Produção e Sinalização',
      'Google Drive integrado para Laudos e Fotos',
      'Implantação e suporte prioritário'
    ]
  }
];

const ROTAS_GRATIS_LIBERADAS = [
  '/agenda',
  '/planos',
  '/minha-empresa',
  '/clientes'
];

export function temAcessoModuloPorPlano(
  plano: TipoPlanoTenant | string | undefined,
  rota: string,
  isMaster: boolean
): boolean {
  if (isMaster) return true;
  if (!plano || plano !== 'GRATIS') return true;
  if (rota === '/') return false;
  return ROTAS_GRATIS_LIBERADAS.some((liberada) => rota === liberada || rota.startsWith(`${liberada}/`));
}

