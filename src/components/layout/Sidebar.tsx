import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTenantContext } from '../../contexts/TenantContext';
import { isMasterEmail } from '../../services/adminService';
import { canAccessRoute } from '../../utils/rbac';
import { menuItems } from './sidebarConfig';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, perfil_acesso: authPerfil } = useAuth();
  const { tenantAtivo, isMaster: isMasterTenant } = useTenantContext();

  const isMaster = Boolean(
    isMasterTenant ||
    (user && (
      isMasterEmail(user.email) ||
      user.user_metadata?.role === 'master' ||
      user.user_metadata?.is_master === true ||
      user.user_metadata?.is_super_admin === true
    ))
  );

  const perfil = tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN';

  const visibleMenuItems = menuItems.filter((item) => {
    if (perfil === 'OPERACIONAL') {
      return ['/producao', '/bde', '/checklist'].includes(item.to);
    }
    return isMaster || canAccessRoute(perfil, item.to);
  });

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* CABEÇALHO DO MENU */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-slate-950 shrink-0">
            <img src="/logo-icon.png" alt="TerraGest" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1">
              <span>TERRA</span><span className="text-amber-400">GEST</span>
            </h1>
            <p className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">ERP Linha Amarela</p>
          </div>
        </div>

        {/* Botão de Fechar no Mobile */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar Menu"
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
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

        {isMaster && perfil !== 'OPERACIONAL' && (
          <div className="pt-3 mt-3 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 block mb-1">
              Super Admin
            </span>
            <NavLink
              to="/master"
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md font-semibold'
                    : 'text-amber-400/90 hover:text-white hover:bg-amber-950/40'
                }`
              }
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="truncate">Painel Master</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">TerraGest ERP v2.0</p>
        <p className="text-[11px] mt-0.5">Gestão de Obras e Linha Amarela</p>
      </div>
    </aside>
  );
};

export default Sidebar;
