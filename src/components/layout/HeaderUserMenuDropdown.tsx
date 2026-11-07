import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, HardHat, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useObraContext } from '../../contexts/ObraContext';
import { useTenantContext } from '../../contexts/TenantContext';
import { isMasterEmail } from '../../services/adminService';
import { HeaderAppearanceSection } from './HeaderAppearanceSection';

export const HeaderUserMenuDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, logout, perfil_acesso: authPerfil } = useAuth();
  const { obras, obraSelecionada, setObraSelecionada, loading: loadingObras } = useObraContext();
  const { tenants, tenantAtivoId, tenantAtivo, setTenantAtivo, loading: loadingTenants, isMaster: isMasterTenant } = useTenantContext();

  const usuarioNome = user?.email ? user.email.split('@')[0] : 'Operador';
  const perfil = tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN';

  const isMaster = Boolean(
    isMasterTenant ||
    (user && (isMasterEmail(user.email) || user.user_metadata?.role === 'master' || user.user_metadata?.is_master === true || user.user_metadata?.is_super_admin === true))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const irPara = (rota: string) => { setOpen(false); navigate(rota); };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Menu do Usuário, Empresa, Aparência e Configurações"
        className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-gray-100 text-slate-700 transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-700 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-gray-800 capitalize hidden sm:inline max-w-[100px] truncate">{usuarioNome}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-left animate-fade-in">
          <div className="p-3 bg-slate-900 text-white border-b border-slate-800">
            <p className="text-xs font-bold capitalize truncate">{usuarioNome}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Perfil: {perfil}
            </span>
          </div>

          <div className="p-3 space-y-2.5 bg-slate-50 border-b border-slate-200 text-xs">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Empresa Ativa</span>
              </label>
              {tenants.length > 1 ? (
                <select
                  disabled={loadingTenants}
                  value={tenantAtivoId || ''}
                  onChange={(e) => e.target.value && setTenantAtivo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.razao_social || t.nome}</option>
                  ))}
                </select>
              ) : (
                <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 truncate">
                  {tenantAtivo?.razao_social || tenantAtivo?.nome || 'Empresa Padrão'}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 mb-1">
                <HardHat className="w-3.5 h-3.5 text-emerald-600" />
                <span>Centro de Custo / Obra</span>
              </label>
              <select
                disabled={loadingObras}
                value={obraSelecionada?.id || ''}
                onChange={(e) => setObraSelecionada(obras.find((o) => o.id === e.target.value) || null)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs"
              >
                <option value="">Todos os Centros de Custo</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>{obra.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <HeaderAppearanceSection />

          <div className="p-2 space-y-1 text-xs">
            <button
              type="button"
              onClick={() => irPara('/minha-empresa')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Minha Empresa & Configurações</span>
            </button>

            {isMaster && perfil !== 'OPERACIONAL' && (
              <button
                type="button"
                onClick={() => irPara('/master')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-800 bg-amber-50/80 hover:bg-amber-100 font-bold transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Painel Master (Super Admin)</span>
              </button>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Encerrar Sessão (Sair)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
