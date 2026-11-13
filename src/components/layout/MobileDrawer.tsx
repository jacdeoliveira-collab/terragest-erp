import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ChevronRight, CircleDollarSign, ClipboardList, FileText,
  HardHat, HelpCircle, LogOut, Moon, Rocket, Settings, Sun, Truck, Users, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTenantContext } from '../../contexts/TenantContext';
import { useAppearance } from '../../contexts/AppearanceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tenantAtivo } = useTenantContext();
  const { theme, setTheme } = useAppearance();

  if (!isOpen) return null;

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const items = [
    { label: 'Serviços & Pedidos', to: '/comercial', icon: ClipboardList },
    { label: 'Boletins (BDE)', to: '/bde', icon: FileText },
    { label: 'Finanças & pagamentos', to: '/financeiro', icon: CircleDollarSign },
    { label: 'Agenda de Máquinas', to: '/agenda', icon: Calendar },
    { label: 'Clientes', to: '/clientes', icon: Users },
    { label: 'Frota & Maquinário', to: '/frota', icon: Truck },
    { label: 'Obras & Centros de Custo', to: '/obras', icon: HardHat },
    { label: 'Planos e preços', to: '/planos', icon: Rocket, highlight: true },
    { label: 'Outras configurações', to: '/minha-empresa', icon: Settings }
  ];

  const userName = (user?.user_metadata?.nome as string) || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div className="w-[82%] max-w-xs h-full bg-[#181622] text-slate-100 flex flex-col shadow-2xl border-r border-slate-800 overflow-y-auto">
        <div className="p-4 flex items-center justify-end">
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-1.5 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => go('/minha-empresa')}
          className="px-5 pb-5 flex items-center gap-3 text-left border-b border-slate-800/80"
        >
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-white p-1.5 flex items-center justify-center">
              <img src={tenantAtivo?.logo_url || '/logo-icon.png'} alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-300 truncate">
              {tenantAtivo?.nome || 'TerraGest ERP'}
            </p>
            <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </button>

        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferências</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 pb-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => go(item.to)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/70 transition-colors"
              >
                <span className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${item.highlight ? 'text-indigo-400' : 'text-indigo-300/80'}`} />
                  <span className={item.highlight ? 'font-semibold text-white' : ''}>{item.label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/70 transition-colors"
          >
            <span className="flex items-center gap-3.5">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-300/80" />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <a
            href="https://wa.me/5598984242792?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20TerraGest%20ERP"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/70 transition-colors"
          >
            <span className="flex items-center gap-3.5">
              <HelpCircle className="w-5 h-5 text-indigo-300/80" />
              <span>Preciso de ajuda</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </a>

          <button
            type="button"
            onClick={async () => { onClose(); await logout(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <span className="flex items-center gap-3.5">
              <LogOut className="w-5 h-5 text-rose-400" />
              <span>Sair da conta</span>
            </span>
            <ChevronRight className="w-4 h-4 text-rose-500/60" />
          </button>
        </nav>
      </div>
      <div onClick={onClose} className="flex-1 bg-black/60 backdrop-blur-xs" />
    </div>
  );
};

