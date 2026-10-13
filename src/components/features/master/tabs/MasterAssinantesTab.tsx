import React, { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import type { TenantMaster, CreateTenantDTO, UpdateTenantDTO } from '../../../../types/tenant.types';
import { NovoTenantModal } from '../NovoTenantModal';
import { MasterAssinantesKPIs } from './MasterAssinantesKPIs';
import { MasterAssinantesTableRow } from './MasterAssinantesTableRow';

interface MasterAssinantesTabProps {
  tenants: TenantMaster[];
  isLoading: boolean;
  onToggleStatus: (id: string, novoStatus: 'ativo' | 'bloqueado') => Promise<{ success: boolean }>;
  onUpdate: (id: string, payload: UpdateTenantDTO) => Promise<{ success: boolean }>;
  onCreate: (payload: CreateTenantDTO) => Promise<{ success: boolean }>;
}

export const MasterAssinantesTab: React.FC<MasterAssinantesTabProps> = ({
  tenants,
  isLoading,
  onToggleStatus,
  onCreate,
}) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');
  const [modalNovoAberto, setModalNovoAberto] = useState<boolean>(false);

  const totalTenants = tenants.length;
  const ativos = tenants.filter((t) => t.status_conta === 'ativo').length;
  const bloqueados = tenants.filter((t) => t.status_conta === 'bloqueado').length;
  const pendentes = tenants.filter((t) => t.status_conta === 'teste').length;
  const mrrTotal = tenants.reduce((acc, t) => acc + (Number(t.plano_valor) || 0), 0);

  const tenantsFiltrados = tenants.filter((t) => {
    const matchStatus = filtroStatus === 'todos' || t.status_conta === filtroStatus;
    const matchBusca = !busca || t.nome.toLowerCase().includes(busca.toLowerCase()) || (t.cnpj && t.cnpj.includes(busca));
    return matchStatus && matchBusca;
  });

  return (
    <div className="space-y-4 text-left">
      {/* 4 KPIs no topo */}
      <MasterAssinantesKPIs
        isLoading={isLoading}
        totalTenants={totalTenants}
        ativos={ativos}
        pendentes={pendentes}
        mrrTotal={mrrTotal}
      />

      {/* Tabela de Listagem Global de Clientes */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Listagem Global de Clientes</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 w-44"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] text-gray-300 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none"
            >
              <option value="todos">Todos ({totalTenants})</option>
              <option value="ativo">Ativos ({ativos})</option>
              <option value="bloqueado">Bloqueados ({bloqueados})</option>
            </select>
            <button
              onClick={() => setModalNovoAberto(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Tenant</span>
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto border border-[#21262d] rounded-lg">
          <table className="w-full text-xs text-left text-gray-300">
            <thead className="bg-[#0d1117] text-[11px] text-gray-400 uppercase font-semibold border-b border-[#21262d]">
              <tr>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Plano</th>
                <th className="py-2.5 px-3">Mensalidade</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {tenantsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum cliente cadastrado no momento.
                  </td>
                </tr>
              ) : (
                tenantsFiltrados.map((t) => (
                  <MasterAssinantesTableRow
                    key={t.id}
                    tenant={t}
                    onToggleStatus={onToggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalNovoAberto && (
        <NovoTenantModal
          onClose={() => setModalNovoAberto(false)}
          onSave={async (payload: CreateTenantDTO) => {
            const res = await onCreate(payload);
            if (res.success) setModalNovoAberto(false);
            return res;
          }}
        />
      )}
    </div>
  );
};
