import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isUserSuperAdmin, isMasterEmail } from '../../services/adminService';

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user, loading: authLoading } = useAuth();
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkRole() {
      if (!session || !user) {
        if (isMounted) {
          setIsSuperAdmin(false);
          setCheckingAdmin(false);
        }
        return;
      }

      setCheckingAdmin(true);
      const isSuper =
        isMasterEmail(user.email) ||
        user.user_metadata?.role === 'master' ||
        user.user_metadata?.is_master === true ||
        user.user_metadata?.is_super_admin === true ||
        (await isUserSuperAdmin(user.id));
      if (isMounted) {
        setIsSuperAdmin(Boolean(isSuper));
        setCheckingAdmin(false);
      }
    }

    if (!authLoading) {
      checkRole();
    }

    return () => {
      isMounted = false;
    };
  }, [session, user, authLoading]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Validando permissões de Super Admin...</span>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionamento limpo e silencioso para o dashboard caso não seja Super Admin
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute = SuperAdminRoute;
