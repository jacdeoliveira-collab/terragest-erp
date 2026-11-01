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
  BadgePercent,
  Building2,
  Navigation,
  Boxes,
  CircleDollarSign,
  Landmark
} from 'lucide-react';

export interface MenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export const menuItems: MenuItem[] = [
  { to: '/', label: 'Dashboard Executivo', icon: LayoutDashboard },
  { to: '/comercial', label: 'Comercial & Gestão de Máquinas', icon: BadgePercent },
  { to: '/obras', label: 'Centros de Custo & Obras', icon: HardHat },
  { to: '/frota', label: 'Gestão de Frotas & Maquinário', icon: Truck },
  { to: '/bde', label: 'Boletins Diários de Equipamento', icon: ClipboardList },
  { to: '/producao', label: 'Produção (Sinaleiro)', icon: Navigation },
  { to: '/almoxarifado', label: 'Almoxarifado & Insumos', icon: Boxes },
  { to: '/financeiro', label: 'Gestão Financeira', icon: CircleDollarSign },
  { to: '/asaas', label: 'Banco Asaas (Chave API)', icon: Landmark },
  { to: '/rh', label: 'Recursos Humanos', icon: Users },
  { to: '/abastecimento', label: 'Abastecimento & Combustível', icon: Fuel },
  { to: '/manutencao', label: 'Manutenção Preventiva', icon: Wrench },
  { to: '/checklist', label: 'Checklists Diários', icon: CheckSquare },
  { to: '/minha-empresa', label: 'Minha Empresa', icon: Building2 }
];
