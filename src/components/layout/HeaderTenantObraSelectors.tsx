import React from 'react';
import { Building2, ChevronDown, HardHat } from 'lucide-react';
import { useObraContext } from '../../contexts/ObraContext';
import { useTenantContext } from '../../contexts/TenantContext';

export const HeaderTenantObraSelectors: React.FC = () => {
  const { obras, obraSelecionada, setObraSelecionada, loading: loadingObras } = useObraContext();
  const { tenants, tenantAtivoId, tenantAtivo, setTenantAtivo, loading: loadingTenants } = useTenantContext();

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
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Dropdown de Empresa Ativa (Tenant Switcher) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center overflow-hidden w-6 h-6 sm:w-7 sm:h-7 shrink-0">
          {tenantAtivo?.logo_url ? (
            <img src={tenantAtivo.logo_url} alt="Logo Empresa" className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </div>

        {tenants.length > 1 ? (
          <div className="relative">
            <select
              disabled={loadingTenants}
              value={tenantAtivoId || ''}
              onChange={handleChangeTenant}
              aria-label="Empresa Ativa"
              className="appearance-none pl-2.5 pr-7 py-1 sm:py-1.5 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 rounded-lg text-[11px] sm:text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.razao_social || t.nome}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-blue-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : (
          <div
            title="Empresa Cadastrada do Usuário"
            className="px-2.5 py-1 sm:py-1.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-[11px] sm:text-xs font-bold text-blue-950 max-w-[130px] sm:max-w-[200px] truncate select-none cursor-default"
          >
            {tenantAtivo?.razao_social || tenantAtivo?.nome || (loadingTenants ? '...' : 'Nenhuma')}
          </div>
        )}
      </div>

      <div className="h-4 sm:h-5 w-px bg-gray-200 hidden xs:block" />

      {/* Dropdown de Centros de Custo / Obras */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
          <HardHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>

        <div className="relative">
          <select
            disabled={loadingObras}
            value={obraSelecionada?.id || ''}
            onChange={handleChangeObra}
            aria-label="Centro de Custo / Obra Ativa"
            className="appearance-none pl-2.5 pr-7 py-1 sm:py-1.5 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100/70 border border-gray-200 rounded-lg text-[11px] sm:text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:text-gray-400 cursor-pointer max-w-[130px] sm:max-w-[190px] truncate"
          >
            {loadingObras ? (
              <option value="">Carregando...</option>
            ) : (
              <>
                <option value="">Todos os C. de Custo</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
                  </option>
                ))}
              </>
            )}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
