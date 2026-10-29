import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, UserPlus } from 'lucide-react';
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

  React.useEffect(() => {
    if (user) {
      handleSuccess();
    }
  }, [user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-950">
      {/* Imagem de Fundo de Maquinários e Terraplanagem */}
      <img
        src="/login-bg.jpg"
        alt="Terraplanagem e Maquinários TerraGest"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay gradiente escuro profissional com desfoque suave */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-900/60 backdrop-blur-[2px]" />

      {/* Conteúdo Central */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-white shadow-2xl shadow-black/60 mb-3 border border-amber-300/40">
            <img src="/logo-terragest.png" alt="TerraGest ERP" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md flex items-center justify-center gap-1">
            <span>TERRA</span><span className="text-amber-400">GEST</span> ERP
          </h1>
          <p className="text-[11px] text-amber-300 font-bold tracking-widest uppercase mt-1 drop-shadow-sm">
            Gestão Integrada de Maquinaria Pesada & Linha Amarela
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40">
          <div className="mb-5 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Autenticação Corporativa</h2>
            <p className="text-xs text-gray-500 mt-0.5">Informe suas credenciais para entrar no sistema</p>
          </div>

          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-5 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Sua construtora ainda não tem conta?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 transition-all shadow-2xs hover:shadow-xs"
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
