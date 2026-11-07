import React from 'react';
import {
  LayoutDashboard,
  Truck,
  HardHat,
  ClipboardList,
  Users,
  CheckSquare,
  Fuel,
  Wrench,
  Gauge,
  Navigation,
  Boxes,
  CircleDollarSign
} from 'lucide-react';
import type { WorkspaceMode } from '../../contexts/WorkspaceModeContext';

export interface MenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
  modos?: WorkspaceMode[];
}

export const menuItems: MenuItem[] = [
  {
    to: '/',
    label: 'Dashboard Executivo',
    icon: LayoutDashboard,
    modos: ['OBRAS']
  },
  {
    to: '/comercial',
    label: 'Serviço por Horímetro',
    icon: Gauge,
    modos: ['HORIMETRO', 'OBRAS']
  },
  {
    to: '/obras',
    label: 'Centros de Custo & Obras',
    icon: HardHat,
    modos: ['OBRAS']
  },
  {
    to: '/frota',
    label: 'Gestão de Frotas & Maquinário',
    icon: Truck,
    modos: ['OBRAS']
  },
  {
    to: '/bde',
    label: 'Boletins Diários de Equipamento',
    icon: ClipboardList,
    modos: ['HORIMETRO', 'OBRAS']
  },
  {
    to: '/producao',
    label: 'Produção (Sinaleiro & Viagens)',
    icon: Navigation,
    modos: ['HORIMETRO', 'OBRAS']
  },
  {
    to: '/almoxarifado',
    label: 'Almoxarifado & Insumos',
    icon: Boxes,
    modos: ['OBRAS']
  },
  {
    to: '/financeiro',
    label: 'Gestão Financeira',
    icon: CircleDollarSign,
    modos: ['OBRAS']
  },
  {
    to: '/rh',
    label: 'Recursos Humanos & Operadores',
    icon: Users,
    modos: ['OBRAS']
  },
  {
    to: '/abastecimento',
    label: 'Abastecimento & Combustível',
    icon: Fuel,
    modos: ['OBRAS']
  },
  {
    to: '/manutencao',
    label: 'Manutenção Preventiva & Corretiva',
    icon: Wrench,
    modos: ['OBRAS']
  },
  {
    to: '/checklist',
    label: 'Checklists Diários',
    icon: CheckSquare,
    modos: ['HORIMETRO', 'OBRAS']
  }
];
