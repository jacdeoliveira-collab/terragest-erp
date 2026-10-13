import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, DollarSign, Truck, TrendingUp, ExternalLink } from 'lucide-react';
import type { AbastecimentoItem } from '../../../types/abastecimento.types';

interface AbastecimentoKpiCardsProps {
  data: AbastecimentoItem[];
  filtroTipo?: string | null;
  onFiltrarTipo?: (tipo: string | null) => void;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const AbastecimentoKpiCards: React.FC<AbastecimentoKpiCardsProps> = ({ data }) => {
  const navigate = useNavigate();

  const litrosTotais = data.reduce((acc, item) => acc + Number(item.quantidade_litros || 0), 0);
  const custoTotal = data.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);
  const maquinasUnicas = new Set(data.map((item) => item.maquina_id || item.maquina_codigo)).size;
  const precoMedio = litrosTotais > 0 ? custoTotal / litrosTotais : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50/50 border-b border-gray-100 text-left">
      {/* 1. Volume Total */}
      <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-emerald-700 text-[10px] font-bold uppercase mb-1">
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-emerald-600" /> Volume Total Diesel</span>
        </div>
        <div className="text-xl font-bold font-mono text-gray-900">
          {litrosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">{data.length} abastecimentos lançados</span>
      </div>

      {/* 2. Custo Total -> Contas a Pagar */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=pagar')}
        title="Clique para ver os pagamentos e notas fiscais de diesel no Contas a Pagar"
        className="p-3.5 bg-white hover:bg-rose-50/40 border border-gray-200 hover:border-rose-400 rounded-xl shadow-xs transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-rose-700 text-[10px] font-bold uppercase mb-1">
          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-rose-600" /> Custo Total Combustível</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="text-xl font-bold font-mono text-rose-700">
          {formatBRL(custoTotal)}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Ver passivos no Contas a Pagar</span>
      </button>

      {/* 3. Máquinas Atendidas -> Frota */}
      <button
        type="button"
        onClick={() => navigate('/frota')}
        title="Clique para ir à origem: Gestão de Frotas e Maquinário"
        className="p-3.5 bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-blue-400 rounded-xl shadow-xs transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-blue-700 text-[10px] font-bold uppercase mb-1">
          <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-600" /> Máquinas Atendidas</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="text-xl font-bold font-mono text-blue-800">
          {maquinasUnicas} equipamentos
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Ver detalhes na Frota</span>
      </button>

      {/* 4. Preço Médio */}
      <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-amber-700 text-[10px] font-bold uppercase mb-1">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Preço Médio / Litro</span>
        </div>
        <div className="text-xl font-bold font-mono text-amber-800">
          {formatBRL(precoMedio)}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 block">Média ponderada por litro</span>
      </div>
    </div>
  );
};
