import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PerfilAcesso } from '../../../types/auth.types';

export interface UsuarioTenantItem {
  id: string;
  user_id: string;
  role: string;
  perfil_acesso?: PerfilAcesso;
  email?: string;
}

interface UsuarioEditPerfilModalProps {
  usuario: UsuarioTenantItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PERFIS: { value: PerfilAcesso; label: string }[] = [
  { value: 'OPERADOR', label: 'Operador de Máquinas (BDE, Horímetro & Campo)' },
  { value: 'OPERACIONAL', label: 'Operacional (Sinaleiro / Apontador)' },
  { value: 'ENGENHARIA', label: 'Engenharia (Encarregado)' },
  { value: 'RH', label: 'Recursos Humanos (DP)' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'ADMIN', label: 'Administrador da Empresa' },
  { value: 'BLOQUEADO', label: 'Bloqueado (Sem Acesso ao Sistema)' }
];

export const UsuarioEditPerfilModal: React.FC<UsuarioEditPerfilModalProps> = ({
  usuario, onClose, onSuccess
}) => {
  const [perfil, setPerfil] = useState<PerfilAcesso>('OPERADOR');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setPerfil((usuario.perfil_acesso as PerfilAcesso) || 'ADMIN');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [usuario]);

  if (!usuario) return null;

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('atualizar_perfil_usuario_tenant', {
        p_tenant_user_id: usuario.id,
        p_perfil_acesso: perfil
      });
      if (rpcError) {
        const novoRole = perfil === 'ADMIN' ? 'admin' : perfil === 'BLOQUEADO' ? 'blocked' : 'member';
        const { error } = await supabase
          .from('tenant_users')
          .update({ perfil_acesso: perfil, role: novoRole })
          .eq('id', usuario.id);
        if (error) throw new Error(error.message);
      } else if (rpcData && !rpcData.success) {
        throw new Error(rpcData.error || 'Erro ao atualizar função.');
      }
      setSuccessMsg(`Função atualizada para ${perfil}!`);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao atualizar função.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">Alterar Função do Usuário</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSalvar} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">Usuário selecionado</span>
            <strong className="text-gray-900">{usuario.email || usuario.user_id}</strong>
          </div>
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /><span className="font-semibold">{successMsg}</span>
            </div>
          )}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nova Função / Perfil (RBAC)</label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilAcesso)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {PERFIS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold cursor-pointer">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Função'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

