import React from 'react';
import { Shield, Trash2 } from 'lucide-react';
import type { TenantMaster } from '../../../../types/tenant.types';

interface MasterAssinantesTableRowProps {
  tenant: TenantMaster;
  onToggleStatus: (id: string, novoStatus: 'ativo' | 'bloqueado') => Promise<{ success: boolean }>;
  onRequestDelete: (tenant: TenantMaster) => void;
}

export const MasterAssinantesTableRow: React.FC<MasterAssinantesTableRowProps> = ({
  tenant,
  onToggleStatus,
  onRequestDelete,
}) => {
  return (
    <tr className="hover:bg-[#161b22] transition-colors">
      <td className="py-2.5 px-3 font-semibold text-white">
        <div>{tenant.nome}</div>
        <div className="text-[10px] text-gray-400">{tenant.slogan || 'Empresa Cadastrada'}</div>
      </td>
      <td className="py-2.5 px-3 font-mono text-gray-300">{tenant.cnpj || 'ISENTO'}</td>
      <td className="py-2.5 px-3">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          {tenant.plano || 'START'}
        </span>
      </td>
      <td className="py-2.5 px-3 font-mono text-gray-200">
        R$ {Number(tenant.plano_valor || 0).toFixed(2)}
      </td>
      <td className="py-2.5 px-3">
        <select
          value={tenant.status_conta}
          onChange={(e) => onToggleStatus(tenant.id, e.target.value as 'ativo' | 'bloqueado')}
          className={`text-[11px] font-bold rounded px-2 py-0.5 border bg-transparent ${
            tenant.status_conta === 'ativo'
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
              : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
          }`}
        >
          <option value="ativo" className="bg-[#11161d] text-emerald-400">Ativo</option>
          <option value="bloqueado" className="bg-[#11161d] text-rose-400">Bloqueado</option>
        </select>
      </td>
      <td className="py-2.5 px-3 text-right">
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => onToggleStatus(tenant.id, tenant.status_conta === 'ativo' ? 'bloqueado' : 'ativo')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition-colors cursor-pointer"
            title="Alternar Status"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRequestDelete(tenant)}
            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-colors cursor-pointer"
            title="Excluir Assinante e Todos os Dados"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
