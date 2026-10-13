import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Tractor, Shield, UserPlus } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForPerfil } from '../utils/rbac';
import type { PerfilAcesso } from '../types/auth.types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, perfil_acesso } = useAuth();

  const handleSuccess = (perfilRecebido?: PerfilAcesso) => {
    const perfil = perfilRecebido || user?.perfil_acesso || perfil_acesso || 'ADMIN';
    if (perfil === 'OPERACIONAL') {
      navigate('/producao', { replace: true });
      return;
    }
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    if (from && from !== '/' && from !== '/dashboard') {
      navigate(from, { replace: true });
    } else {
      navigate(getDefaultRouteForPerfil(perfil), { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-950 mb-3">
            <Tractor className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TerraGest SaaS</h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-1">
            GESTÃO INTEGRADA DE MAQUINARIA PESADA E LINHA AMARELA
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Autenticação Corporativa</h2>
            <p className="text-xs text-gray-500 mt-0.5">Informe suas credenciais para entrar no sistema</p>
          </div>

          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-5 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Sua construtora ainda não tem conta?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs border border-emerald-200 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nova Empresa? Cadastre-se grátis</span>
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso Seguro com Criptografia e RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
