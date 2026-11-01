import type { PerfilAcesso } from '../types/auth.types';

export const ROTAS_OPERACIONAL = ['/producao', '/bde', '/checklist'];

export const ROTAS_ENGENHARIA = [
  ...ROTAS_OPERACIONAL,
  '/obras',
  '/frota',
  '/almoxarifado',
  '/manutencao',
  '/abastecimento'
];

export const ROTAS_RH = ['/rh'];

export const ROTAS_FINANCEIRO = ['/financeiro', '/faturamento', '/receber', '/pagar', '/comercial'];

export const ROTAS_ADMIN = [
  '/',
  '/dashboard',
  '/comercial',
  '/obras',
  '/frota',
  '/bde',
  '/producao',
  '/almoxarifado',
  '/financeiro',
  '/asaas',
  '/faturamento',
  '/receber',
  '/pagar',
  '/rh',
  '/abastecimento',
  '/manutencao',
  '/checklist',
  '/minha-empresa'
];

export const PERFIS_ROTAS: Record<PerfilAcesso, string[]> = {
  OPERACIONAL: ROTAS_OPERACIONAL,
  ENGENHARIA: ROTAS_ENGENHARIA,
  RH: ROTAS_RH,
  FINANCEIRO: ROTAS_FINANCEIRO,
  ADMIN: ROTAS_ADMIN
};

export function canAccessRoute(perfil: PerfilAcesso | undefined | null, path: string): boolean {
  if (!perfil || perfil === 'ADMIN') return true;
  const rotasPermitidas = PERFIS_ROTAS[perfil] || [];
  const normalizedPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return rotasPermitidas.includes(normalizedPath);
}

export function getDefaultRouteForPerfil(perfil: PerfilAcesso | undefined | null): string {
  if (perfil === 'OPERACIONAL') return '/producao';
  if (perfil === 'RH') return '/rh';
  if (perfil === 'FINANCEIRO') return '/financeiro';
  return '/dashboard';
}
