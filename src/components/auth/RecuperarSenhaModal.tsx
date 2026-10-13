import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';

interface RecuperarSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailPadrao?: string;
}

export const RecuperarSenhaModal: React.FC<RecuperarSenhaModalProps> = ({
  isOpen,
  onClose,
  emailPadrao = ''
}) => {
  const [email, setEmail] = useState(emailPadrao);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Por favor, informe um endereço de e-mail válido.');
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/redefinir-senha`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl
      });

      if (resetError) {
        throw resetError;
      }

      setSucesso(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao solicitar link de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    setError(null);
    setSucesso(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleFechar} title="Recuperação de Senha & Primeiro Acesso">
      {sucesso ? (
        <div className="text-center py-4 space-y-3 text-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Link de Acesso Enviado!</h3>
          <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
            Enviamos um link de segurança para <strong>{email}</strong>. Abra o e-mail (verifique também a pasta de spam) para definir sua nova senha.
          </p>
          <button
            type="button"
            onClick={handleFechar}
            className="w-full mt-3 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Entendi, voltar ao Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleEnviar} className="space-y-4 text-xs text-left">
          <p className="text-gray-500 leading-relaxed">
            Se sua empresa foi cadastrada recentemente ou você esqueceu suas credenciais, informe seu e-mail corporativo abaixo para receber o link de criação/redefinição de senha.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wide text-[11px]">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleFechar}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
