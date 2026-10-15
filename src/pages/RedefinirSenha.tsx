import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const RedefinirSenha: React.FC = () => {
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCheckingSession(false);
      if (!session) setError('O link de recuperação expirou ou é inválido. Solicite um novo link.');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (senha.length < 6) return setError('A senha deve ter no mínimo 6 caracteres.');
    if (senha !== confirmSenha) return setError('As senhas não coincidem. Digite novamente.');

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: senha });
      if (updateError) throw updateError;
      setSucesso(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 text-left">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl shadow-black/50 mb-2 border border-amber-300/40">
            <img src="/logo-terragest.png" alt="TerraGest" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white flex items-center justify-center gap-1">
            <span>TERRA</span><span className="text-amber-400">GEST</span> ERP
          </h1>
          <p className="text-[11px] text-amber-300 uppercase tracking-wider">Definição de Senha Corporativa</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 text-xs">
          {sucesso ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Senha Definida com Sucesso!</h2>
              <p className="text-gray-600">Sua senha foi atualizada. Você já pode acessar a plataforma.</p>
              <button onClick={() => navigate('/login')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer">
                Acessar Plataforma Agora
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Cadastrar Nova Senha</h2>
                <p className="text-gray-500 text-[11px]">Defina sua senha de acesso (mínimo de 6 dígitos)</p>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {checkingSession ? (
                <div className="text-center py-6 text-gray-400">Verificando autorização...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nova Senha *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      <input
                        type={showSenha ? 'text' : 'password'} required placeholder="••••••••"
                        value={senha} onChange={(e) => setSenha(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
                      />
                      <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600 cursor-pointer">
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Confirmar Nova Senha *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      <input
                        type={showSenha ? 'text' : 'password'} required placeholder="••••••••"
                        value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Salvar Senha & Acessar</span>}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="mt-4 pt-2 border-t border-gray-100 text-center">
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px]">
                  Voltar para Tela de Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
