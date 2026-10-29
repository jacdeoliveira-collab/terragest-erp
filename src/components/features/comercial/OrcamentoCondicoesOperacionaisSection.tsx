import React from 'react';
import { UserCheck, Fuel, Truck, ShieldAlert } from 'lucide-react';

interface OrcamentoCondicoesOperacionaisSectionProps {
  operadorIncluso: boolean;
  setOperadorIncluso: (v: boolean) => void;
  combustivelTermo: string;
  setCombustivelTermo: (v: string) => void;
  mobilizacaoTermo: string;
  setMobilizacaoTermo: (v: string) => void;
}

export const OrcamentoCondicoesOperacionaisSection: React.FC<OrcamentoCondicoesOperacionaisSectionProps> = ({
  operadorIncluso,
  setOperadorIncluso,
  combustivelTermo,
  setCombustivelTermo,
  mobilizacaoTermo,
  setMobilizacaoTermo
}) => {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-left">
      <div className="flex items-center gap-1.5 font-bold text-slate-800">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span>Condições Operacionais de Locação (Linha Amarela)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Operador de Máquina */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-600" /> Operador de Máquina
          </label>
          <select
            value={operadorIncluso ? 'SIM' : 'NAO'}
            onChange={(e) => setOperadorIncluso(e.target.value === 'SIM')}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="SIM">Incluso pela Locadora</option>
            <option value="NAO">Por conta do Contratante</option>
          </select>
        </div>

        {/* Combustível / Diesel */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Fuel className="w-3 h-3 text-rose-600" /> Abastecimento / Diesel
          </label>
          <select
            value={combustivelTermo}
            onChange={(e) => setCombustivelTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Por conta do Contratante">Por conta do Contratante</option>
            <option value="Incluso no Valor da Hora">Incluso pela Locadora</option>
            <option value="Medição de Consumo à Parte">Medição à Parte</option>
          </select>
        </div>

        {/* Mobilização / Prancha */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600" /> Mobilização / Prancha
          </label>
          <select
            value={mobilizacaoTermo}
            onChange={(e) => setMobilizacaoTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Por conta do Contratante">Por conta do Contratante</option>
            <option value="Incluso na Proposta">Incluso na Proposta</option>
            <option value="A combinar conforme distância">A combinar / Sob consulta</option>
          </select>
        </div>
      </div>
    </div>
  );
};
