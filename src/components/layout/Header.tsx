import React from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CentralAlertasBell } from './CentralAlertasBell';
import { HeaderTenantObraSelectors } from './HeaderTenantObraSelectors';

interface HeaderProps {
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const { user, logout } = useAuth();
  const usuarioNome = user?.email ? user.email.split('@')[0] : 'Operador';

  return (
    <header className="h-16 px-3 sm:px-5 lg:px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm gap-2 sm:gap-4">
      {/* LADO ESQUERDO: BOTÃO HAMBÚRGUER (MOBILE) + SELETORES */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir Menu de Navegação"
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <HeaderTenantObraSelectors />
      </div>

      {/* LADO DIREITO: ALERTAS, PERFIL & LOGOUT */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <CentralAlertasBell />

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-700 shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-xs hidden md:block">
            <span className="font-semibold text-gray-800 block capitalize truncate max-w-[120px]">{usuarioNome}</span>
            <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Encerrar Sessão"
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
