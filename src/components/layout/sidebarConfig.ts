import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Building2,
  ClipboardList,
  Users,
  CheckSquare,
  Fuel,
  Wrench,
  Gauge,
  Navigation,
  Boxes,
  CircleDollarSign,
  Calendar,
  Rocket
} from 'lucide-react';

export interface MenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
  destaque?: boolean;
}

export const menuItems: MenuItem[] = [
  { to: '/comercial', label: 'Serviços por Horímetro', icon: Gauge, destaque: true },
  { to: '/', label: 'Dashboard Executivo', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda e Fila de Máquinas', icon: Calendar },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/centros-custo', label: 'Centros de Custo', icon: Building2 },
  { to: '/frota', label: 'Gestão de Maquinário', icon: Truck },
  { to: '/bde', label: 'Boletim de Equipamentos', icon: ClipboardList },
  { to: '/producao', label: 'Sinaleira & Produção', icon: Navigation },
  { to: '/almoxarifado', label: 'Almoxarifado & Insumos', icon: Boxes },
  { to: '/financeiro', label: 'Gestão Financeira', icon: CircleDollarSign },
  { to: '/rh', label: 'RH & Operadores', icon: Users },
  { to: '/abastecimento', label: 'Abastecimento & Melosa', icon: Fuel },
  { to: '/manutencao', label: 'Manutenção Preventiva', icon: Wrench },
  { to: '/checklist', label: 'Checklist Diário', icon: CheckSquare },
  { to: '/planos', label: 'Planos e Preços', icon: Rocket }
];
