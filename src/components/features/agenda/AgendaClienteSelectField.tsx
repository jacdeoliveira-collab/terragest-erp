import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ClienteModal } from '../comercial/ClienteModal';
import type { Cliente, CreateClienteDTO } from '../../../types/comercial.types';

interface Props {
  clientes: Cliente[];
  clienteId: string;
  onSelect: (cliente: Cliente | null, id: string) => void;
  onCriarCliente: (dados: CreateClienteDTO) => Promise<{ success: boolean; data?: Cliente }>;
}

export const AgendaClienteSelectField: React.FC<Props> = ({
  clientes,
  clienteId,
  onSelect,
  onCriarCliente
}) => {
  const [modalClienteOpen, setModalClienteOpen] = useState(false);

  const handleSalvarNovoCliente = async (dados: CreateClienteDTO): Promise<boolean> => {
    const res = await onCriarCliente(dados);
    if (res.success && res.data) {
      onSelect(res.data, res.data.id);
      return true;
    }
    return false;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="font-semibold text-gray-700">Cliente Cadastrado</label>
        <button
          type="button"
          onClick={() => setModalClienteOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
        >
          <UserPlus className="w-3 h-3" />
          <span>Novo Cliente</span>
        </button>
      </div>
      <select
        value={clienteId}
        onChange={(e) => {
          const id = e.target.value;
          const cli = clientes.find((c) => c.id === id) || null;
          onSelect(cli, id);
        }}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Selecionar cliente da carteira...</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <ClienteModal
        isOpen={modalClienteOpen}
        onClose={() => setModalClienteOpen(false)}
        onSalvar={handleSalvarNovoCliente}
      />
    </div>
  );
};
