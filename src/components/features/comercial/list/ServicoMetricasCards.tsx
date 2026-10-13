import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Fuel, TrendingUp, DollarSign, Clock, ExternalLink } from 'lucide-react';

interface ServicoMetricasCardsProps {
  metricas: {
    totalHoras: number;
    faturamentoTotal: number;
    combustivelTotal: number;
    lucroLiquidoTotal: number;
    totalRecebido?: number;
    saldoAReceberTotal?: number;
  };
}

export const ServicoMetricasCards: React.FC<ServicoMetricasCardsProps> = ({ metricas }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Horas Totais -> Boletins Diários */}
      <button
        type="button"
        onClick={() => navigate('/boletim')}
        title="Clique para ir à origem: Boletins Diários de Equipamento"
        className="p-3.5 bg-white hover:bg-emerald-50/40 border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left cursor-pointer group"
      >
        <div>
          <span className="text-[10px] text-gray-500 group-hover:text-emerald-700 font-bold uppercase flex items-center gap-1">
            Horas Totais <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <span className="text-xl font-black text-gray-900 font-mono">
            {metricas.totalHoras.toFixed(1)} h
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Gauge className="w-5 h-5" />
        </div>
      </button>

      {/* 2. Faturamento Bruto -> Contas a Receber */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=receber')}
        title="Clique para ir à origem: Contas a Receber / Faturamento"
        className="p-3.5 bg-white hover:bg-emerald-50/40 border border-gray-200 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left cursor-pointer group"
      >
        <div>
          <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
            Faturamento Bruto <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <span className="text-xl font-black text-emerald-700 font-mono">
            R$ {metricas.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
      </button>

      {/* 3. Valores a Receber -> Contas a Receber */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=receber')}
        title="Clique para ir à origem: Contas a Receber (Saldos em Aberto)"
        className="p-3.5 bg-white hover:bg-amber-50/40 border border-gray-200 hover:border-amber-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left cursor-pointer group"
      >
        <div>
          <span className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1">
            Valores a Receber <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <span className="text-xl font-black text-amber-700 font-mono">
            R$ {(metricas.saldoAReceberTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {metricas.totalRecebido !== undefined && metricas.totalRecebido > 0 && (
            <span className="text-[9px] text-gray-400 block font-semibold">
              Recebido: R$ {metricas.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </button>

      {/* 4. Combustível Total -> Abastecimentos */}
      <button
        type="button"
        onClick={() => navigate('/abastecimento')}
        title="Clique para ir à origem: Gestão de Abastecimento & Diesel"
        className="p-3.5 bg-white hover:bg-rose-50/40 border border-gray-200 hover:border-rose-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left cursor-pointer group"
      >
        <div>
          <span className="text-[10px] text-rose-600 font-bold uppercase flex items-center gap-1">
            Combustível Total <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <span className="text-xl font-black text-rose-700 font-mono">
            R$ {metricas.combustivelTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <Fuel className="w-5 h-5" />
        </div>
      </button>

      {/* 5. Lucro Líquido Real -> DRE & Centros de Custo */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=centros-custo')}
        title="Clique para ir à origem: DRE e Centros de Custo"
        className="p-3.5 bg-white hover:bg-teal-50/40 border border-gray-200 hover:border-teal-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left cursor-pointer group"
      >
        <div>
          <span className="text-[10px] text-teal-600 font-bold uppercase flex items-center gap-1">
            Lucro Líquido Real <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </span>
          <span className="text-xl font-black text-teal-700 font-mono">
            R$ {metricas.lucroLiquidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-teal-50 group-hover:bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
};
