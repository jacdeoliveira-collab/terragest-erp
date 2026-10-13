import React from 'react';
import type { CargoFuncionario, StatusFuncionario } from '../../../../types/rh.types';

interface DadosPessoaisProps {
  nome: string;
  setNome: (val: string) => void;
  cargo: CargoFuncionario;
  setCargo: (val: CargoFuncionario) => void;
  status: StatusFuncionario;
  setStatus: (val: StatusFuncionario) => void;
  telefone: string;
  setTelefone: (val: string) => void;
  enderecoCompleto: string;
  setEnderecoCompleto: (val: string) => void;
  pinAssinatura?: string;
  setPinAssinatura?: (val: string) => void;
}

export const DadosPessoais: React.FC<DadosPessoaisProps> = ({
  nome,
  setNome,
  cargo,
  setCargo,
  status,
  setStatus,
  telefone,
  setTelefone,
  enderecoCompleto,
  setEnderecoCompleto,
  pinAssinatura = '',
  setPinAssinatura
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Nome Completo *</label>
        <input
          required
          placeholder="Ex: Carlos Eduardo Santos"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Função / Cargo *</label>
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value as CargoFuncionario)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="OPERADOR_MAQUINA">Operador de Máquinas</option>
            <option value="OPERADOR_ESCAVADEIRA">Operador de Escavadeira</option>
            <option value="OPERADOR_TRATOR">Operador de Trator</option>
            <option value="MECANICO">Mecânico</option>
            <option value="MOTORISTA">Motorista de Caçamba / Apoio</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Status Contratual *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFuncionario)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ATIVO">Ativo</option>
            <option value="FERIAS">Férias</option>
            <option value="AFASTADO">Afastado</option>
            <option value="DESLIGADO">Desligado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
          <input
            placeholder="(11) 98765-4321"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">PIN Checklist (4 Dígitos)</label>
          <input
            type="password"
            maxLength={4}
            placeholder="Ex: 1234"
            value={pinAssinatura}
            onChange={(e) => setPinAssinatura && setPinAssinatura(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-mono tracking-widest text-center focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Endereço Residencial Completo</label>
        <input
          placeholder="Rua, Número, Bairro, Cidade - UF"
          value={enderecoCompleto}
          onChange={(e) => setEnderecoCompleto(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
