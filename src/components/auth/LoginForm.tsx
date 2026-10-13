import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RecuperarSenhaModal } from './RecuperarSenhaModal';
import type { PerfilAcesso } from '../../types/auth.types';

interface LoginFormProps {
  onSuccess?: (perfilAcesso?: PerfilAcesso) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, loading, error, limparErro } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalRecuperar, setIsModalRecuperar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    try {
      const res = await login(email.trim(), password);
      onSuccess?.(res?.perfil_acesso);
    } catch {
      // O erro já está no estado do useAuth
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            E-mail Corporativo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@terragest.com.br"
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Senha de Acesso
            </label>
            <button
              type="button"
              onClick={() => setIsModalRecuperar(true)}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer transition-colors"
            >
              Esqueci a senha
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span>Conectando...</span>
          ) : (
            <>
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsModalRecuperar(true)}
            className="text-xs text-gray-500 hover:text-emerald-700 font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Primeiro acesso ou sem senha?</span>
            <span className="text-emerald-600 font-bold underline">Definir senha</span>
          </button>
        </div>
      </form>

      <RecuperarSenhaModal
        isOpen={isModalRecuperar}
        onClose={() => setIsModalRecuperar(false)}
        emailPadrao={email}
      />
    </>
  );
};
