import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTenantContext } from '../../contexts/TenantContext';
import { canAccessRoute, getDefaultRouteForPerfil } from '../../utils/rbac';

export const RoleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, perfil_acesso: authPerfil, logout } = useAuth();
  const { tenantAtivo } = useTenantContext();
  const location = useLocation();

  const perfil = tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN';

  if (perfil === 'BLOQUEADO') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-lg space-y-3">
          <h2 className="text-base font-bold text-rose-700">Acesso Bloqueado</h2>
          <p className="text-xs text-gray-600">Seu usuário foi bloqueado pelo administrador da empresa e não possui permissão para acessar ou alterar dados.</p>
          <button type="button" onClick={() => logout()} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800">
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  if (!canAccessRoute(perfil, location.pathname)) {
    const fallback = getDefaultRouteForPerfil(perfil);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
