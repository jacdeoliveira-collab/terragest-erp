import React from 'react';
import { User, HardHat, LogOut, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useObraContext } from '../../contexts/ObraContext';
import { useTenantContext } from '../../contexts/TenantContext';
import { AlertasManutencaoBell } from './AlertasManutencaoBell';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { obras, obraSelecionada, setObraSelecionada, loading: loadingObras } = useObraContext();
  const { tenants, tenantAtivoId, tenantAtivo, setTenantAtivo, loading: loadingTenants } = useTenantContext();

  const usuarioNome = user?.email ? user.email.split('@')[0] : 'Operador';

  const handleChangeObra = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selecionada = obras.find((o) => o.id === id) || null;
    setObraSelecionada(selecionada);
  };

  const handleChangeTenant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id && id !== tenantAtivoId) {
      setTenantAtivo(id);
    }
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm gap-4">
      {/* SELETORES: EMPRESA ATIVA (TENANT) + OBRA ATIVA */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Dropdown de Empresa Ativa (Tenant Switcher) */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center overflow-hidden w-7 h-7 shrink-0">
            {tenantAtivo?.logo_url ? (
              <img src={tenantAtivo.logo_url} alt="Logo Empresa" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>

          {tenants.length > 1 ? (
            <div className="relative">
              <select
                disabled={loadingTenants}
                value={tenantAtivoId || ''}
                onChange={handleChangeTenant}
                aria-label="Empresa Ativa"
                className="appearance-none pl-3 pr-8 py-1.5 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 rounded-lg text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[210px] truncate"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.razao_social || t.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <div
              title="Empresa Cadastrada do Usuário"
              className="px-3 py-1.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs font-bold text-blue-950 max-w-[210px] truncate select-none cursor-default"
            >
              {tenantAtivo?.razao_social || tenantAtivo?.nome || (loadingTenants ? 'Carregando...' : 'Nenhuma empresa')}
            </div>
          )}
        </div>

        {/* Divisor vertical */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Dropdown de Centros de Custo / Obras */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <HardHat className="w-4 h-4" />
          </div>

          <div className="relative">
            <select
              disabled={loadingObras}
              value={obraSelecionada?.id || ''}
              onChange={handleChangeObra}
              aria-label="Centro de Custo / Obra Ativa"
              className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100/70 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-all cursor-pointer max-w-[210px] truncate"
            >
              {loadingObras ? (
                <option value="">Carregando...</option>
              ) : (
                <>
                  <option value="">Todos os Centros de Custo</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nome}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* PERFIL & LOGOUT */}
      <div className="flex items-center gap-4">
        <AlertasManutencaoBell />
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gray-800 block capitalize">{usuarioNome}</span>
            <span className="text-[10px] text-gray-400">{user?.email}</span>
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
