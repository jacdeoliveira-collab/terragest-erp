import React from 'react';
import { DollarSign, Building2, Tag } from 'lucide-react';
import type { CategoriaCusto } from '../../../types/manutencao.types';
import type { Obra } from '../../../types/obras.types';

export interface ManutencaoCustosTabProps {
  obraId: string;
  setObraId: (val: string) => void;
  categoriaCustoId: string;
  setCategoriaCustoId: (val: string) => void;
  valorPecas: number;
  setValorPecas: (val: number) => void;
  valorMaoObra: number;
  setValorMaoObra: (val: number) => void;
  obras: Obra[];
  loadingObras: boolean;
  categorias: CategoriaCusto[];
  loadingCategorias: boolean;
}

export const ManutencaoCustosTab: React.FC<ManutencaoCustosTabProps> = ({
  obraId,
  setObraId,
  categoriaCustoId,
  setCategoriaCustoId,
  valorPecas,
  setValorPecas,
  valorMaoObra,
  setValorMaoObra,
  obras,
  loadingObras,
  categorias,
  loadingCategorias
}) => {
  const total = (Number(valorPecas) || 0) + (Number(valorMaoObra) || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Centro de Custo / Obra *</span>
          </label>
          <select
            required
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            disabled={loadingObras || obras.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{obras.length === 0 ? 'Nenhuma obra cadastrada' : 'Selecione o Canteiro / Obra'}</option>
            {obras.map((ob) => (
              <option key={ob.id} value={ob.id}>
                {ob.nome} {ob.cliente ? `(${ob.cliente})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Categoria de Custo Financeiro *</span>
          </label>
          <select
            required
            value={categoriaCustoId}
            onChange={(e) => setCategoriaCustoId(e.target.value)}
            disabled={loadingCategorias || categorias.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione a categoria de manutenção</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Valor de Peças & Componentes (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valorPecas || ''}
            onChange={(e) => setValorPecas(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Valor da Mão de Obra (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valorMaoObra || ''}
            onChange={(e) => setValorMaoObra(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-900 uppercase">Custo Total da OS</p>
            <p className="text-[10px] text-emerald-700">Apropriado diretamente na obra selecionada</p>
          </div>
        </div>
        <span className="text-base font-bold font-mono text-emerald-800">
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
};
