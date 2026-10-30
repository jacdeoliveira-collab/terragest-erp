import React from 'react';
import { UserCheck, Fuel, Truck, ShieldAlert, Utensils, ShieldCheck } from 'lucide-react';

interface OrcamentoCondicoesOperacionaisSectionProps {
  operadorIncluso: boolean;
  setOperadorIncluso: (v: boolean) => void;
  combustivelTermo: string;
  setCombustivelTermo: (v: string) => void;
  mobilizacaoTermo: string;
  setMobilizacaoTermo: (v: string) => void;
  alimentacaoTermo: string;
  setAlimentacaoTermo: (v: string) => void;
  guardaTermo: string;
  setGuardaTermo: (v: string) => void;
  observacoesLivres: string;
  setObservacoesLivres: (v: string) => void;
}

export const OrcamentoCondicoesOperacionaisSection: React.FC<OrcamentoCondicoesOperacionaisSectionProps> = ({
  operadorIncluso,
  setOperadorIncluso,
  combustivelTermo,
  setCombustivelTermo,
  mobilizacaoTermo,
  setMobilizacaoTermo,
  alimentacaoTermo,
  setAlimentacaoTermo,
  guardaTermo,
  setGuardaTermo,
  observacoesLivres,
  setObservacoesLivres
}) => {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-left">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span>Matriz de Responsabilidades Operacionais (Linha Amarela)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Fuel className="w-3 h-3 text-rose-600" /> Combustível / Diesel
          </label>
          <select
            value={combustivelTermo}
            onChange={(e) => setCombustivelTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Por conta do Contratante (Fornecido na Obra)">Por conta do Contratante (na Obra)</option>
            <option value="Incluso no Valor da Hora">Incluso no Valor da Hora</option>
            <option value="Reembolsado por Medição de Litros">Reembolso por Medição à Parte</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600" /> Frete / Prancha (Ida e Volta)
          </label>
          <select
            value={mobilizacaoTermo}
            onChange={(e) => setMobilizacaoTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Por conta do Contratante">Por conta do Contratante</option>
            <option value="Cobrado conforme Taxa de Mobilização">Cobrado na Proposta (Mobilização)</option>
            <option value="Incluso na Proposta (Cortesia)">Incluso na Proposta (Cortesia)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Utensils className="w-3 h-3 text-amber-600" /> Alimentação & Hospedagem Operador
          </label>
          <select
            value={alimentacaoTermo}
            onChange={(e) => setAlimentacaoTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Por conta do Contratante no local da obra">Por conta do Contratante na obra</option>
            <option value="Por conta da Locadora">Por conta da Locadora</option>
            <option value="Apenas refeição no canteiro pelo Contratante">Apenas refeição no canteiro (Contratante)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-600" /> Guarda e Vigilância no Canteiro
          </label>
          <select
            value={guardaTermo}
            onChange={(e) => setGuardaTermo(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="Responsabilidade integral do Contratante no canteiro">Responsabilidade do Contratante no canteiro</option>
            <option value="Equipamento recolhido diariamente ao pátio">Recolhido diariamente ao pátio</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Cláusulas / Observações Especiais da Proposta (Opcional)</label>
        <input
          type="text"
          placeholder="Ex: Medição quinzenal via BDE assinado; Mobilização em até 24h após confirmação do sinal..."
          value={observacoesLivres}
          onChange={(e) => setObservacoesLivres(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};
