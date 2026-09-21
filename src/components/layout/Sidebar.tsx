import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  HardHat,
  ClipboardList,
  Users,
  CheckSquare,
  Fuel,
  Wrench,
  Tractor
} from 'lucide-react';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras', label: 'Centros de Custo (Obras)', icon: HardHat },
  { to: '/frota', label: 'Frota & Equipamentos', icon: Truck },
  { to: '/bde', label: 'Boletim Diário (BDE)', icon: ClipboardList },
  { to: '/rh', label: 'Recursos Humanos', icon: Users },
  { to: '/abastecimento', label: 'Abastecimento & Combustível', icon: Fuel },
  { to: '/manutencao', label: 'Manutenção Preventiva', icon: Wrench },
  { to: '/checklist', label: 'Checklists Diários', icon: CheckSquare }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950">
          <Tractor className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white">TerraGest</h1>
          <p className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase">ERP Linha Amarela</p>
        </div>
      </div>

      <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">TerraGest ERP v2.0</p>
        <p className="text-[11px] mt-0.5">Gestão de Obras e Linha Amarela</p>
      </div>
    </aside>
  );
};

export default Sidebar;
