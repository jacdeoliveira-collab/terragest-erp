import React, { useState } from 'react';
import { Building2, AlertCircle, Plus } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { WhiteLabelConfig } from './WhiteLabelConfig';
import { NovoTenantModal } from './NovoTenantModal';
import { TenantTableRow } from './TenantTableRow';
import type { TenantMaster, UpdateTenantDTO, CreateTenantDTO } from '../../../types/tenant.types';

interface TenantListProps {
  tenants: TenantMaster[];
  isLoading: boolean;
  error: string | null;
  onToggleStatus: (id: string, novoStatus: 'ativo' | 'bloqueado') => Promise<{ success: boolean }>;
  onUpdate: (id: string, payload: UpdateTenantDTO) => Promise<{ success: boolean; error?: string }>;
  onCreate?: (payload: CreateTenantDTO) => Promise<{ success: boolean; error?: string }>;
}

export const TenantList: React.FC<TenantListProps> = ({
  tenants,
  isLoading,
  error,
  onToggleStatus,
  onUpdate,
  onCreate
}) => {
  const [tenantSelecionado, setTenantSelecionado] = useState<TenantMaster | null>(null);
  const [isNovoOpen, setIsNovoOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">
        Carregando base de construtoras cadastradas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Empresas Clientes & Assinaturas SaaS
          </h3>
          <p className="text-[11px] text-gray-500">Gestão de acesso, planos comerciais, bloqueio e white-label</p>
        </div>

        {onCreate && (
          <button
            onClick={() => setIsNovoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Empresa</span>
          </button>
        )}
      </div>

      {tenants.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Nenhuma empresa cadastrada no banco de dados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Empresa / Slogan</th>
                <th className="p-3.5 text-center">Plano SaaS</th>
                <th className="p-3.5">CNPJ</th>
                <th className="p-3.5 text-right">Mensalidade</th>
                <th className="p-3.5 text-center">Venc. Contrato</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {tenants.map((item) => (
                <TenantTableRow
                  key={item.id}
                  tenant={item}
                  onConfig={setTenantSelecionado}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={Boolean(tenantSelecionado)}
        onClose={() => setTenantSelecionado(null)}
        title="Personalização White-Label & Assinatura"
      >
        {tenantSelecionado && (
          <WhiteLabelConfig
            tenant={tenantSelecionado}
            onSave={onUpdate}
            onClose={() => setTenantSelecionado(null)}
          />
        )}
      </Modal>

      {onCreate && (
        <Modal
          isOpen={isNovoOpen}
          onClose={() => setIsNovoOpen(false)}
          title="Cadastrar Nova Empresa Cliente (Tenant)"
        >
          <NovoTenantModal onSave={onCreate} onClose={() => setIsNovoOpen(false)} />
        </Modal>
      )}
    </div>
  );
};
