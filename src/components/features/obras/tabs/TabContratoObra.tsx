import React from 'react';
import type { StatusObra } from '../../../../types/obras.types';

interface TabContratoObraProps {
  nome: string;
  setNome: (val: string) => void;
  clienteNome: string;
  setClienteNome: (val: string) => void;
  clienteCnpj: string;
  setClienteCnpj: (val: string) => void;
  status: StatusObra;
  setStatus: (val: StatusObra) => void;
}

export const TabContratoObra: React.FC<TabContratoObraProps> = ({
  nome,
  setNome,
  clienteNome,
  setClienteNome,
  clienteCnpj,
  setClienteCnpj,
  status,
  setStatus
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Nome da Obra / Loteamento / Frente de Serviço *
        </label>
        <input
          required
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Terraplanagem Loteamento Reserva dos Ipês"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nome do Cliente / Incorporadora
          </label>
          <input
            type="text"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Ex: Construtora e Urbanizadora Horizonte S/A"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            CNPJ do Cliente
          </label>
          <input
            type="text"
            value={clienteCnpj}
            onChange={(e) => setClienteCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Status Operacional do Canteiro *
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusObra)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="NAO_INICIADA">Não Iniciada (Mobilização / Planejamento)</option>
          <option value="EM_ANDAMENTO">Em Andamento (Operação Ativa)</option>
          <option value="PARALISADA">Paralisada (Aguardando Liberação / Chuva)</option>
          <option value="CONCLUIDA">Concluída (Entregue e Faturada)</option>
        </select>
      </div>
    </div>
  );
};
