import React from 'react';
import { Menu } from 'lucide-react';
import { CentralAlertasBell } from './CentralAlertasBell';
import { HeaderModeSwitcher } from './HeaderModeSwitcher';
import { HeaderUserMenuDropdown } from './HeaderUserMenuDropdown';

interface HeaderProps {
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  return (
    <header className="h-16 px-3 sm:px-5 lg:px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm gap-2 sm:gap-4">
      {/* LADO ESQUERDO: BOTÃO HAMBÚRGUER (MOBILE) + LOGO & NOME DO APLICATIVO */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir Menu de Navegação"
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-gray-200 shrink-0">
            <img src="/logo-icon.png" alt="TerraGest" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1">
              <span>TERRA</span><span className="text-amber-500">GEST</span>
            </h1>
            <p className="text-[10px] text-amber-500 font-bold tracking-wider uppercase">
              ERP Linha Amarela
            </p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: SELETOR DE MODO, ALERTAS & MENU DO USUÁRIO (EMPRESA, OBRA, MASTER) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <HeaderModeSwitcher />
        <CentralAlertasBell />
        <HeaderUserMenuDropdown />
      </div>
    </header>
  );
};

export default Header;
