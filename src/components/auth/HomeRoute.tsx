import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTenantContext } from '../../contexts/TenantContext';
import { Dashboard } from '../../pages/Dashboard';

export const HomeRoute: React.FC = () => {
  const { user, perfil_acesso: authPerfil } = useAuth();
  const { tenantAtivo } = useTenantContext();
  const perfil = tenantAtivo?.perfil_acesso || user?.perfil_acesso || authPerfil || 'ADMIN';

  if (perfil === 'OPERACIONAL') {
    return <Navigate to="/producao" replace />;
  }
  if (perfil === 'RH') {
    return <Navigate to="/rh" replace />;
  }
  if (perfil === 'FINANCEIRO') {
    return <Navigate to="/faturamento" replace />;
  }

  return <Dashboard />;
};

export default HomeRoute;
