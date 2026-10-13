import React, { useState } from 'react';
import { Plus, Users, AlertCircle } from 'lucide-react';
import { useClientes } from '../../../hooks/useClientes';
import { ClienteModal } from './ClienteModal';
import { ClienteHistoricoModal } from './modal/ClienteHistoricoModal';
import { ClienteTableRow } from './ClienteTableRow';
import type { Cliente, CreateClienteDTO } from '../../../types/comercial.types';

export const ClienteList: React.FC = () => {
  const { clientes, isLoading, error, criarCliente, atualizarCliente, excluirCliente } = useClientes();
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [clienteHistorico, setClienteHistorico] = useState<Cliente | null>(null);

  const handleNovo = () => {
    setClienteParaEditar(null);
    setModalAberto(true);
  };

  const handleEditar = (c: Cliente) => {
    setClienteParaEditar(c);
    setModalAberto(true);
  };

  const handleExcluir = async (c: Cliente) => {
    if (window.confirm(`Deseja realmente excluir o cliente "${c.nome}"?`)) {
      await excluirCliente(c.id);
    }
  };

  const handleSalvar = async (dados: CreateClienteDTO): Promise<boolean> => {
    if (clienteParaEditar) {
      const res = await atualizarCliente(clienteParaEditar.id, dados);
      return res.success;
    }
    const res = await criarCliente(dados);
    return res.success;
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-400">Carregando carteira de clientes...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs text-left">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Carteira de Clientes (Contratantes)
          </h3>
          <p className="text-[11px] text-gray-500">Clique no cliente para ver o histórico de faturamento e serviços realizados</p>
        </div>
        <button onClick={handleNovo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {clientes.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Nenhum cliente cadastrado no momento.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Nome / Razão Social</th>
                <th className="p-3.5">CPF / CNPJ</th>
                <th className="p-3.5">WhatsApp / Telefone</th>
                <th className="p-3.5">Endereço / Localização</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {clientes.map((c) => (
                <ClienteTableRow
                  key={c.id}
                  cliente={c}
                  onVerHistorico={(cli) => setClienteHistorico(cli)}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClienteHistoricoModal
        isOpen={Boolean(clienteHistorico)}
        onClose={() => setClienteHistorico(null)}
        cliente={clienteHistorico}
        onEditar={(cli) => handleEditar(cli)}
      />

      <ClienteModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        clienteParaEditar={clienteParaEditar}
        onSalvar={handleSalvar}
      />
    </div>
  );
};
