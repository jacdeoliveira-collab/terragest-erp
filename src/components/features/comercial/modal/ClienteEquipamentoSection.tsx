import React from 'react';
import { Plus } from 'lucide-react';
import type { Cliente } from '../../../../types/comercial.types';
import { ClienteCardResumo } from './ClienteCardResumo';

interface ClienteEquipamentoSectionProps {
  clienteNome: string;
  setClienteNome: (v: string) => void;
  clienteId?: string;
  setClienteId?: (v: string) => void;
  setClienteDocumento?: (v: string) => void;
  setClienteTelefone?: (v: string) => void;
  maquinaNome: string;
  setMaquinaNome: (v: string) => void;
  clientes: Cliente[];
  maquinasDisponiveis: string[];
  onAbrirNovoCliente: () => void;
  onAbrirNovaMaquina: () => void;
  onEditarCliente?: (c: Cliente) => void;
}

export const ClienteEquipamentoSection: React.FC<ClienteEquipamentoSectionProps> = ({
  clienteNome, setClienteNome,
  setClienteId, setClienteDocumento, setClienteTelefone,
  maquinaNome, setMaquinaNome,
  clientes, maquinasDisponiveis,
  onAbrirNovoCliente, onAbrirNovaMaquina, onEditarCliente
}) => {
  const clienteSelecionado = clientes.find(
    (c) => c.nome.toLowerCase() === clienteNome.trim().toLowerCase()
  );

  const handleSelectCliente = (nomeEscolhido: string) => {
    setClienteNome(nomeEscolhido);
    const encontrado = clientes.find((c) => c.nome === nomeEscolhido);
    if (setClienteId) setClienteId(encontrado?.id || '');
    if (setClienteDocumento) setClienteDocumento(encontrado?.documento || '');
    if (setClienteTelefone) setClienteTelefone(encontrado?.telefone || '');
  };

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-gray-700">Cliente Contratante *</label>
            <button
              type="button"
              onClick={onAbrirNovoCliente}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Cadastrar Novo</span>
            </button>
          </div>
          <select
            value={clienteNome}
            onChange={(e) => handleSelectCliente(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-gray-900 font-medium"
          >
            <option value="">Selecione na carteira</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
            {!clientes.some(c => c.nome.toLowerCase() === clienteNome.trim().toLowerCase()) && clienteNome && (
              <option value={clienteNome}>{clienteNome}</option>
            )}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-gray-700">Máquina / Equipamento *</label>
            <button
              type="button"
              onClick={onAbrirNovaMaquina}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Cadastrar Máquina</span>
            </button>
          </div>
          <select
            value={maquinaNome}
            onChange={(e) => setMaquinaNome(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-gray-900 font-medium"
          >
            <option value="">Selecione da frota</option>
            {maquinasDisponiveis.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
            {!maquinasDisponiveis.includes(maquinaNome) && maquinaNome && (
              <option value={maquinaNome}>{maquinaNome}</option>
            )}
          </select>
        </div>
      </div>

      {clienteSelecionado && (
        <ClienteCardResumo cliente={clienteSelecionado} onEditar={onEditarCliente} />
      )}
    </div>
  );
};
