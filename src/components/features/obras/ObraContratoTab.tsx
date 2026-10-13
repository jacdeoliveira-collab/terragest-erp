import React from 'react';
import type { StatusObra } from '../../../types/obras.types';
import { useClientes } from '../../../hooks/useClientes';

interface ObraContratoTabProps {
  nome: string;
  setNome: (val: string) => void;
  status: StatusObra;
  setStatus: (val: StatusObra) => void;
  clienteNome: string;
  setClienteNome: (val: string) => void;
  clienteCnpj: string;
  setClienteCnpj: (val: string) => void;
}

export const ObraContratoTab: React.FC<ObraContratoTabProps> = ({
  nome, setNome, status, setStatus,
  clienteNome, setClienteNome, clienteCnpj, setClienteCnpj
}) => {
  const { clientes } = useClientes();

  const handleSelecionarCliente = (nomeEscolhido: string) => {
    setClienteNome(nomeEscolhido);
    const clienteEncontrado = clientes.find((c) => c.nome === nomeEscolhido);
    if (clienteEncontrado && clienteEncontrado.documento) {
      setClienteCnpj(clienteEncontrado.documento);
    }
  };

  return (
    <div className="space-y-4 text-xs text-left">
      <div>
        <label className="block font-semibold text-gray-700 mb-1.5">
          Nome da Obra / Centro de Custo *
        </label>
        <input
          required
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Terraplanagem Loteamento Reserva dos Ipês"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1.5">
          Status da Obra *
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusObra)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="EM_ANDAMENTO">Em Andamento (Operação Ativa)</option>
          <option value="PARALISADA">Paralisada (Aguardando Liberação / Chuva)</option>
          <option value="CONCLUIDA">Concluída (Entregue e Faturada)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-1.5">
            Cliente / Contratante (Carteira Integrada)
          </label>
          <select
            value={clienteNome}
            onChange={(e) => handleSelecionarCliente(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="">Selecione o cliente na carteira</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
            {!clientes.some(c => c.nome.toLowerCase() === clienteNome.trim().toLowerCase()) && clienteNome && (
              <option value={clienteNome}>{clienteNome}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1.5">
            CPF / CNPJ do Cliente
          </label>
          <input
            type="text"
            value={clienteCnpj}
            onChange={(e) => setClienteCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
