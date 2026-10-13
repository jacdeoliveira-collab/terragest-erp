import React from 'react';
import { DollarSign, Fuel, Wrench, AlertCircle } from 'lucide-react';
import { useObraFinanceiro } from '../../../hooks/useObraFinanceiro';
import { ObraDreTable } from './ObraDreTable';

interface ObraFinanceiroTabProps {
  obraId?: string;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ObraFinanceiroTab: React.FC<ObraFinanceiroTabProps> = ({ obraId }) => {
  const { resumo, loading, error } = useObraFinanceiro(obraId);

  if (!obraId) {
    return (
      <div className="p-8 text-center bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl my-2">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Painel Financeiro / DRE</h4>
        <p className="text-xs font-semibold text-gray-600 mt-1">Salve a obra primeiro para acessar o painel financeiro</p>
        <p className="text-[11px] text-gray-400 mt-0.5 max-w-md mx-auto">
          Custos de manutenções, peças e abastecimentos são agregados automaticamente ao centro de custo após o registro da obra.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-xs text-gray-400">Calculando apropriação de custos da obra...</div>;
  if (error) {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  const { custoTotalGeral, totalCombustivel, totalLitrosCombustivel, totalManutencao } = resumo;
  const percComb = custoTotalGeral > 0 ? (totalCombustivel / custoTotalGeral) * 100 : 0;
  const percManut = custoTotalGeral > 0 ? (totalManutencao / custoTotalGeral) * 100 : 0;

  return (
    <div className="space-y-4 text-left">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Receita Bruta</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-900">{formatBRL(resumo.receitaTotal || 0)}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Medições & Horímetro</div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-700 uppercase">Custos Diretos</span>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-base font-bold font-mono text-gray-900">{formatBRL(custoTotalGeral)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Despesas Apropriadas</div>
        </div>

        <div className={`p-3 border rounded-xl ${(resumo.lucroOperacional || 0) >= 0 ? 'bg-teal-50/80 border-teal-200' : 'bg-rose-50/80 border-rose-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase ${(resumo.lucroOperacional || 0) >= 0 ? 'text-teal-800' : 'text-rose-800'}`}>
              Lucro Operacional
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${(resumo.lucroOperacional || 0) >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
              {(resumo.margemLucro || 0).toFixed(1)}%
            </span>
          </div>
          <div className={`text-base font-bold font-mono ${(resumo.lucroOperacional || 0) >= 0 ? 'text-teal-900' : 'text-rose-900'}`}>
            {formatBRL(resumo.lucroOperacional || 0)}
          </div>
          <div className={`text-[10px] mt-0.5 ${(resumo.lucroOperacional || 0) >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
            Margem Líquida da Obra
          </div>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase">Diesel Consumido</span>
            <Fuel className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold font-mono text-amber-900">{formatBRL(totalCombustivel)}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">{totalLitrosCombustivel.toFixed(1)}L ({resumo.qtdAbastecimentos} abast.)</div>
        </div>
      </div>

      {/* Barras de Progresso Visuais */}
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
          Composição Percentual dos Custos
        </span>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-amber-800 flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-amber-600" /> Combustível / Diesel</span>
            <span className="font-mono text-gray-700">{formatBRL(totalCombustivel)} ({percComb.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, percComb)}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-blue-800 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-blue-600" /> Manutenção (Peças + Mão de Obra)</span>
            <span className="font-mono text-gray-700">{formatBRL(totalManutencao)} ({percManut.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, percManut)}%` }} />
          </div>
        </div>
      </div>

      <ObraDreTable resumo={resumo} />
    </div>
  );
};
