import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { UsuarioFormModal } from './UsuarioFormModal';
import type { PerfilAcesso } from '../../../types/auth.types';

interface TenantUserRecord {
  id: string;
  user_id: string;
  role: string;
  perfil_acesso?: PerfilAcesso;
  created_at?: string;
  email?: string;
}

const BADGE_COLORS: Record<PerfilAcesso, string> = {
  OPERACIONAL: 'bg-amber-50 text-amber-700 border-amber-200',
  ENGENHARIA: 'bg-blue-50 text-blue-700 border-blue-200',
  RH: 'bg-purple-50 text-purple-700 border-purple-200',
  FINANCEIRO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const EmpresaUsuariosTab: React.FC<{ tenantId?: string }> = ({ tenantId }) => {
  const [usuarios, setUsuarios] = useState<TenantUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tenant_users')
        .select('id, user_id, role, perfil_acesso, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      setUsuarios((data || []) as TenantUserRecord[]);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-900 leading-normal">
            Controle de Perfis de Acesso (RBAC): Gerencie operadores, apontadores e administradores da sua construtora.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shrink-0 cursor-pointer shadow-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Novo Acesso</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-500" />
            Usuários Vinculados ({usuarios.length})
          </span>
          <button type="button" onClick={fetchUsuarios} disabled={loading} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Carregando acessos...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <p>Nenhum colaborador registrado nesta empresa.</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              Criar o primeiro acesso
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {usuarios.map((u) => {
              const perfil = (u.perfil_acesso as PerfilAcesso) || 'ADMIN';
              const badgeClass = BADGE_COLORS[perfil] || 'bg-gray-100 text-gray-700 border-gray-200';
              return (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 font-mono text-[11px]">{u.user_id}</p>
                    <p className="text-[10px] text-gray-400">Papel: {u.role || 'membro'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                    {perfil}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UsuarioFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tenantId={tenantId}
        onSuccess={fetchUsuarios}
      />
    </div>
  );
};
