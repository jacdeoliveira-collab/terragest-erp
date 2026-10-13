import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Fuel, Wrench, Clock, ExternalLink } from 'lucide-react';
import type { ObraDetalheHistoricoData } from '../../../../hooks/useObraDetalheHistorico';

interface Props {
  data: ObraDetalheHistoricoData;
}

export const ObraResumoCards: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
      {/* 1. Custo Consolidado -> Financeiro / DRE */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?aba=centros-custo')}
        title="Clique para ir à origem: DRE e Gestão Financeira deste Centro de Custo"
        className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-400 rounded-xl p-3 transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-slate-600" />
            Custo Consolidado
          </span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
        </div>
        <div className="text-base font-bold text-slate-900 font-mono">
          R$ {data.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-slate-500 mt-0.5 block">Ver DRE no Financeiro</span>
      </button>

      {/* 2. Diesel Consumido -> Abastecimento */}
      <button
        type="button"
        onClick={() => navigate('/abastecimento')}
        title="Clique para ir à origem: Gestão de Abastecimento & Diesel"
        className="bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 hover:border-amber-400 rounded-xl p-3 transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-amber-700 text-[11px] mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Fuel className="w-3.5 h-3.5 text-amber-600" />
            Diesel Consumido
          </span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
        </div>
        <div className="text-base font-bold text-amber-800 font-mono">
          R$ {data.custoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-amber-600 font-mono">{data.litrosCombustivel.toFixed(1)} L • Ver notas</div>
      </button>

      {/* 3. Manutenção & Peças -> Manutenção */}
      <button
        type="button"
        onClick={() => navigate('/manutencao')}
        title="Clique para ir à origem: Ordens de Serviço & Manutenções"
        className="bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/80 hover:border-rose-400 rounded-xl p-3 transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-rose-700 text-[11px] mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Wrench className="w-3.5 h-3.5 text-rose-600" />
            Manutenção & Peças
          </span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
        </div>
        <div className="text-base font-bold text-rose-800 font-mono">
          R$ {data.custoManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-rose-600 mt-0.5 block">Ver O.S. no módulo</span>
      </button>

      {/* 4. Horas Apontadas -> Boletins */}
      <button
        type="button"
        onClick={() => navigate('/boletim')}
        title="Clique para ir à origem: Boletins Diários de Equipamento (BDE)"
        className="bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 hover:border-blue-400 rounded-xl p-3 transition-all cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between text-blue-700 text-[11px] mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Horas Apontadas
          </span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
        </div>
        <div className="text-base font-bold font-mono text-blue-800">
          {data.totalHorasApontadas.toFixed(1)} h
        </div>
        <div className="text-[10px] text-blue-600">{data.boletins.length} apontamentos • Ver BDEs</div>
      </button>
    </div>
  );
};
