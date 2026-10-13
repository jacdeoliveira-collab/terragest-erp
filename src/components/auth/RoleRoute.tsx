import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTenantContext } from '../../contexts/TenantContext';
import { canAccessRoute, getDefaultRouteForPerfil } from '../../utils/rbac';

export const RoleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, perfil_acesso: authPerfil } = useAuth();
  const { tenantAtivo } = useTenantContext();
  const location = useLocation();

  const perfil = tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN';

  if (!canAccessRoute(perfil, location.pathname)) {
    const fallback = getDefaultRouteForPerfil(perfil);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
