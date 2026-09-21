import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plane, Shield } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-950 mb-3">
            <Plane className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TerraGest SaaS</h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-1">
            Gestão Integrada de Maquinário Pesado & Drones
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Autenticação Corporativa</h2>
            <p className="text-xs text-gray-500 mt-0.5">Informe suas credenciais para entrar no sistema</p>
          </div>

          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso Seguro com Criptografia e RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
