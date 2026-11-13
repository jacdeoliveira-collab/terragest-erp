import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Home } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Navegação Mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#181622] border-t border-slate-800/90 px-4 flex items-center justify-around shadow-2xl"
    >
      <NavLink
        to="/inicio"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 px-6 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Início</span>
      </NavLink>

      <NavLink
        to="/gestao"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 px-6 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <BarChart3 className="w-5 h-5" />
        <span>Gestão</span>
      </NavLink>
    </nav>
  );
};

