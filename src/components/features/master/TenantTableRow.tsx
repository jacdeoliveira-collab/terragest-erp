import React from 'react';
import { ShieldCheck, ShieldAlert, Settings, Building, Zap, Crown, Rocket, Calendar } from 'lucide-react';
import type { TenantMaster, TipoPlanoTenant } from '../../../types/tenant.types';

interface TenantTableRowProps {
  tenant: TenantMaster;
  onConfig: (tenant: TenantMaster) => void;
  onToggleStatus: (id: string, novoStatus: 'ativo' | 'bloqueado') => void;
}

const renderPlanoBadge = (plano?: TipoPlanoTenant) => {
  const p = plano || 'START';
  switch (p) {
    case 'ENTERPRISE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Crown className="w-3 h-3 text-purple-600" />
          ENTERPRISE
        </span>
      );
    case 'PRO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Zap className="w-3 h-3 text-blue-600" />
          PRO
        </span>
      );
    case 'START':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Rocket className="w-3 h-3 text-amber-600" />
          START
        </span>
      );
  }
};

export const TenantTableRow: React.FC<TenantTableRowProps> = ({ tenant, onConfig, onToggleStatus }) => {
  const isBloqueado = tenant.status_conta === 'bloqueado';
  const mensalidade = tenant.valor_mensalidade ?? tenant.plano_valor ?? 0;
  const emailExibicao = tenant.admin_email || tenant.contato_email;

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3.5 font-semibold text-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt="" className="w-5 h-5 object-contain" />
            ) : (
              <Building className="w-4 h-4" />
            )}
          </div>
          <div>
            <span>{tenant.nome}</span>
            {emailExibicao && <span className="block text-[10px] text-gray-400 font-mono">{emailExibicao}</span>}
          </div>
        </div>
      </td>

      <td className="p-3.5 text-center">
        {renderPlanoBadge(tenant.plano)}
      </td>

      <td className="p-3.5 font-mono text-gray-600">{tenant.cnpj || '-'}</td>

      <td className="p-3.5 font-mono font-bold text-gray-900 text-right">
        R$ {Number(mensalidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>

      <td className="p-3.5 text-center font-mono text-[11px]">
        {tenant.assinatura_fim ? (
          <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
            <Calendar className="w-3 h-3 text-emerald-600" />
            {new Date(tenant.assinatura_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        ) : (
          <span className="text-gray-400">Contínuo</span>
        )}
      </td>

      <td className="p-3.5 text-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
            isBloqueado
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isBloqueado ? <ShieldAlert className="w-3 h-3 text-rose-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
          {isBloqueado ? 'BLOQUEADO' : 'ATIVO'}
        </span>
      </td>

      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onConfig(tenant)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Ajustar Assinatura e White-label"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
            <span>Configurar</span>
          </button>

          <button
            onClick={() => onToggleStatus(tenant.id, isBloqueado ? 'ativo' : 'bloqueado')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isBloqueado
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
            }`}
          >
            {isBloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
        </div>
      </td>
    </tr>
  );
};
