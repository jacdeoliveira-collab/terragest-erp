import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tractor, Shield, CheckCircle2 } from 'lucide-react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [sucesso, setSucesso] = useState(false);
  const [confirmacaoEmail, setConfirmacaoEmail] = useState(false);

  const handleSuccess = (requiresEmailConfirmation?: boolean) => {
    if (requiresEmailConfirmation) {
      setConfirmacaoEmail(true);
      setSucesso(true);
    } else {
      // Usuário logado: redirecionar automaticamente para o Dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-950 mb-3">
            <Tractor className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TerraGest SaaS</h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-1">
            CREDENCIAMENTO DE NOVA EMPRESA & 15 DIAS GRÁTIS
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          {sucesso ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Conta Criada com Sucesso!</h2>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                {confirmacaoEmail
                  ? 'Enviamos um link de confirmação para o seu e-mail. Ative sua conta para fazer o primeiro login.'
                  : 'Sua empresa e credenciais foram configuradas com 15 dias de período de teste liberado.'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Ir para Tela de Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Cadastro de Construtora / Locadora</h2>
                <p className="text-xs text-gray-500 mt-0.5">Preencha os dados corporativos para iniciar seu teste gratuito</p>
              </div>

              <RegisterForm onSuccess={handleSuccess} />

              <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-500">Já tem conta? </span>
                <Link to="/login" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Fazer Login
                </Link>
              </div>
            </>
          )}

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Isolamento Multitenant Blindado & Criptografia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
