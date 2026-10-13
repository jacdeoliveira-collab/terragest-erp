import React, { useState } from 'react';
import { Building2, Mail, Lock, FileText, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { registerEmpresa } from '../../services/authRegisterService';

interface RegisterFormProps {
  onSuccess: (requiresEmailConfirmation?: boolean) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);
    const res = await registerEmpresa({
      razaoSocial,
      cnpj: cnpj.trim() || undefined,
      email,
      senha
    });
    setLoading(false);

    if (res.success) {
      onSuccess(res.requiresEmailConfirmation);
    } else {
      setError(res.error || 'Falha ao realizar cadastro da empresa.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Razão Social / Nome da Empresa *</label>
        <div className="relative">
          <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text" required placeholder="Ex: Terraplenagem & Obras Silva Ltda"
            value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">CNPJ (Opcional)</label>
        <div className="relative">
          <FileText className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text" placeholder="00.000.000/0001-00"
            value={cnpj} onChange={(e) => setCnpj(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">E-mail Corporativo do Administrador *</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="email" required placeholder="diretoria@empresa.com.br"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Senha (mín. 6 dígitos) *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type={showSenha ? 'text' : 'password'} required placeholder="••••••••"
              value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
            />
            <button
              type="button" onClick={() => setShowSenha(!showSenha)}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-emerald-600"
            >
              {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Confirmar Senha *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type={showSenha ? 'text' : 'password'} required placeholder="••••••••"
              value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
            />
          </div>
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Criando sua conta...</span>
          </>
        ) : (
          <>
            <span>Criar Conta & Iniciar Avaliação</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
