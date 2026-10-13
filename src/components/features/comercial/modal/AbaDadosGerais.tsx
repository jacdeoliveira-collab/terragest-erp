import React from 'react';
import type { Cliente } from '../../../../types/comercial.types';
import { useObras } from '../../../../hooks/useObras';
import { ClienteEquipamentoSection } from './ClienteEquipamentoSection';

interface AbaDadosGeraisProps {
  clienteNome: string;
  setClienteNome: (v: string) => void;
  clienteId?: string;
  setClienteId?: (v: string) => void;
  setClienteDocumento?: (v: string) => void;
  setClienteTelefone?: (v: string) => void;
  obraId?: string;
  setObraId?: (v: string) => void;
  obraNome?: string;
  setObraNome?: (v: string) => void;
  maquinaNome: string;
  setMaquinaNome: (v: string) => void;
  operadorNome: string;
  setOperadorNome: (v: string) => void;
  descricaoServico: string;
  setDescricaoServico: (v: string) => void;
  dataInicio: string;
  setDataInicio: (v: string) => void;
  dataFim?: string;
  setDataFim?: (v: string) => void;
  clientes: Cliente[];
  maquinasDisponiveis: string[];
  operadoresDisponiveis: string[];
  onAbrirNovoCliente: () => void;
  onAbrirNovaMaquina: () => void;
  onEditarCliente?: (c: Cliente) => void;
  onSelectOperador?: (nome: string) => void;
}

export const AbaDadosGerais: React.FC<AbaDadosGeraisProps> = ({
  clienteNome, setClienteNome,
  clienteId, setClienteId, setClienteDocumento, setClienteTelefone,
  obraId, setObraId, setObraNome,
  maquinaNome, setMaquinaNome,
  operadorNome, setOperadorNome,
  descricaoServico, setDescricaoServico,
  dataInicio, setDataInicio,
  dataFim, setDataFim,
  clientes, maquinasDisponiveis, operadoresDisponiveis,
  onAbrirNovoCliente, onAbrirNovaMaquina, onEditarCliente, onSelectOperador
}) => {
  const { obras } = useObras();

  return (
    <div className="space-y-3.5 text-xs text-left">
      <ClienteEquipamentoSection
        clienteNome={clienteNome} setClienteNome={setClienteNome}
        clienteId={clienteId} setClienteId={setClienteId}
        setClienteDocumento={setClienteDocumento} setClienteTelefone={setClienteTelefone}
        maquinaNome={maquinaNome} setMaquinaNome={setMaquinaNome}
        clientes={clientes} maquinasDisponiveis={maquinasDisponiveis}
        onAbrirNovoCliente={onAbrirNovoCliente}
        onAbrirNovaMaquina={onAbrirNovaMaquina}
        onEditarCliente={onEditarCliente}
      />

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Centro de Custo / Obra (Alocação Financeira & DRE)</label>
        <select
          value={obraId || ''}
          onChange={(e) => {
            const id = e.target.value;
            setObraId?.(id);
            const found = obras.find((o) => o.id === id);
            setObraNome?.(found?.nome || '');
          }}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-gray-900 font-medium"
        >
          <option value="">Selecione o Centro de Custo / Obra...</option>
          {obras.map((ob) => (
            <option key={ob.id} value={ob.id}>
              {ob.nome} {ob.cliente ? `(${ob.cliente})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Operador</label>
          <select
            value={operadorNome}
            onChange={(e) => {
              setOperadorNome(e.target.value);
              onSelectOperador?.(e.target.value);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-gray-900 font-medium"
          >
            <option value="">Selecione o operador</option>
            {operadoresDisponiveis.map((op, idx) => (
              <option key={idx} value={op}>{op}</option>
            ))}
            {!operadoresDisponiveis.includes(operadorNome) && operadorNome && (
              <option value={operadorNome}>{operadorNome}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Data Início</label>
          <input
            type="date" value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-mono"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Data Fim (Opcional)</label>
          <input
            type="date" value={dataFim || ''}
            onChange={(e) => setDataFim?.(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Descrição do Serviço / Obra</label>
        <textarea
          rows={2} placeholder="Ex: Abertura de valas, drenagem e limpeza de terreno"
          value={descricaoServico} onChange={(e) => setDescricaoServico(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};
