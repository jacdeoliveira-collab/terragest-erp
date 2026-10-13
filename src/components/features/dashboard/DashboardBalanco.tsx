import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Scale, ExternalLink } from 'lucide-react';
import type { DashboardGlobalMetrics } from '../../../hooks/useDashboardGlobal';

interface DashboardBalancoProps {
  metrics: DashboardGlobalMetrics;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const DashboardBalanco: React.FC<DashboardBalancoProps> = ({ metrics }) => {
  const navigate = useNavigate();
  const maxVal = Math.max(metrics.totalReceitasMes, metrics.totalDespesasMes, 1);
  const percReceitas = Math.min(100, (metrics.totalReceitasMes / maxVal) * 100);
  const percDespesas = Math.min(100, (metrics.totalDespesasMes / maxVal) * 100);
  const isPositivo = metrics.saldoProjetado >= 0;

  return (
    <div className="p-5 bg-white border border-gray-200/90 rounded-2xl shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            Balanço Mensal: Receitas vs Despesas
          </h3>
          <p className="text-xs text-gray-500">Fluxo financeiro projetado com base em medições emitidas e passivos registrados</p>
        </div>

        {/* Card Saldo Projetado */}
        <div
          onClick={() => navigate('/financeiro')}
          title="Clique para abrir a Gestão Financeira Completa"
          className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-all ${
            isPositivo ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70' : 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100/70'
          }`}
        >
          {isPositivo ? <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" /> : <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wide flex items-center gap-1">
              Saldo Projetado <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </span>
            <span className="text-base font-bold font-mono">{formatBRL(metrics.saldoProjetado)}</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Horizontais (Tailwind CSS) */}
      <div className="space-y-4 pt-1">
        {/* Barra 1: Receitas (Medições) */}
        <div
          onClick={() => navigate('/financeiro?aba=receber')}
          title="Clique para ir à origem: Contas a Receber (Medições)"
          className="space-y-1.5 p-2 rounded-xl hover:bg-emerald-50/50 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 group-hover:text-emerald-800 flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              Recebimentos Totais (Medições de Obras)
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
            </span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {formatBRL(metrics.totalReceitasMes)}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${percReceitas}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-mono">
            <span>Aguardando: {formatBRL(metrics.aReceberNoMes)}</span>
            <span>Quitado: {formatBRL(metrics.recebidoNoMes)}</span>
          </div>
        </div>

        {/* Barra 2: Despesas (Contas a Pagar) */}
        <div
          onClick={() => navigate('/financeiro?aba=pagar')}
          title="Clique para ir à origem: Contas a Pagar (Despesas)"
          className="space-y-1.5 p-2 rounded-xl hover:bg-rose-50/50 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 group-hover:text-rose-800 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              Pagamentos Totais (Diesel, Peças, Locações e RH)
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
            </span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {formatBRL(metrics.totalDespesasMes)}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-rose-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${percDespesas}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-mono">
            <span>Pendente: {formatBRL(metrics.aPagarNoMes)}</span>
            <span>Pago: {formatBRL(metrics.pagoNoMes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
