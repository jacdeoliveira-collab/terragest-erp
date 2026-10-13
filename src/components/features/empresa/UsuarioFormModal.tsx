import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PerfilAcesso } from '../../../types/auth.types';

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  onSuccess?: () => void;
}

const PERFIS: { value: PerfilAcesso; label: string }[] = [
  { value: 'OPERACIONAL', label: 'Operacional (Sinaleiro / Apontador)' },
  { value: 'ENGENHARIA', label: 'Engenharia (Encarregado)' },
  { value: 'RH', label: 'Recursos Humanos (DP)' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'ADMIN', label: 'Administrador da Empresa' }
];

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  isOpen, onClose, tenantId, onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<PerfilAcesso>('OPERACIONAL');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return setErrorMsg('Identificador da empresa não encontrado.');
    setLoading(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      const { data, error } = await supabase.rpc('criar_usuario_tenant', {
        p_tenant_id: tenantId,
        p_email: email.trim().toLowerCase(),
        p_password: password,
        p_perfil_acesso: perfil
      });
      if (error) throw new Error(error.message);
      if (data && data.success === false) throw new Error(data.error || 'Falha ao criar usuário');
      setSuccessMsg(`Usuário ${email} criado e vinculado com perfil ${perfil}!`);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha na comunicação com o banco');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Criar Acesso de Colaborador (RBAC)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Isolamento SaaS:</strong> Cria no Auth e vincula à empresa via RPC <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">criar_usuario_tenant</code> sem deslogar o Admin.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span className="text-[11px]">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /><span className="text-[11px] font-semibold">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@construtora.com"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Senha Provisória (Mínimo 6 caracteres)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Perfil de Acesso (RBAC)</label>
            <select
              value={perfil} onChange={(e) => setPerfil(e.target.value as PerfilAcesso)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {PERFIS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer">
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Criando...' : 'Criar e Vincular Usuário'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
