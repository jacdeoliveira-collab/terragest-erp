import React from 'react';
import type { TipoPropriedadeEquipamento } from '../../../../types/equipment.types';

interface Props {
  placa: string; setPlaca: (val: string) => void;
  tipoPropriedade: TipoPropriedadeEquipamento; setTipoPropriedade: (val: TipoPropriedadeEquipamento) => void;
  fornecedorLocacao: string; setFornecedorLocacao: (val: string) => void;
  valorLocacaoMensal: number; setValorLocacaoMensal: (val: number) => void;
  valorAquisicao: number; setValorAquisicao: (val: number) => void;
  custoHoraEstimado: number; setCustoHoraEstimado: (val: number) => void;
}

export const DadosPatrimonioMaquina: React.FC<Props> = ({
  placa, setPlaca, tipoPropriedade, setTipoPropriedade,
  fornecedorLocacao, setFornecedorLocacao, valorLocacaoMensal, setValorLocacaoMensal,
  valorAquisicao, setValorAquisicao, custoHoraEstimado, setCustoHoraEstimado
}) => {
  return (
    <div className="space-y-3.5">
      <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800">
        Gestão patrimonial, regime de posse (próprio ou locado) e custo horário de apropriação nos canteiros de obra.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Regime de Propriedade *</label>
          <select
            value={tipoPropriedade}
            onChange={(e) => setTipoPropriedade(e.target.value as TipoPropriedadeEquipamento)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value="PROPRIO">Equipamento Próprio (Ativo Imobilizado)</option>
            <option value="LOCADO">Equipamento Locado (Terceiros / Aluguel)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Placa (Mercosul / Brasil)</label>
          <input
            placeholder="Ex: ABC-1D23"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono uppercase focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {tipoPropriedade === 'LOCADO' ? (
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">Empresa Locadora *</label>
              <input
                placeholder="Ex: Armac Locação de Máquinas LTDA"
                value={fornecedorLocacao}
                onChange={(e) => setFornecedorLocacao(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">Valor da Locação Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valorLocacaoMensal || ''}
                onChange={(e) => setValorLocacaoMensal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Valor Contábil / Aquisição (R$)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 850000.00"
            value={valorAquisicao || ''}
            onChange={(e) => setValorAquisicao(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
          <span>Custo Horário de Referência (R$/h)</span>
          <span className="text-[10px] text-gray-400">Usado no rateio de custo de operação</span>
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Ex: 220.00"
          value={custoHoraEstimado || ''}
          onChange={(e) => setCustoHoraEstimado(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
