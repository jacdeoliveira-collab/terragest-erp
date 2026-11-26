import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useDashboardGlobal } from '../hooks/useDashboardGlobal';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useObraContext } from '../contexts/ObraContext';
import { DashboardCards } from '../components/features/dashboard/DashboardCards';
import { DashboardBalanco } from '../components/features/dashboard/DashboardBalanco';
import { EficienciaChart } from '../components/features/dashboard/EficienciaChart';
import { GraficoHoras } from '../components/dashboard/GraficoHoras';
import { exportDashboardPDF } from '../services/exportDashboardPdf';

export const Dashboard: React.FC = () => {
  const { metrics: globalMetrics, isLoading: loadingGlobal, refetch: refetchGlobal } = useDashboardGlobal();
  const { metrics: operationalMetrics } = useDashboardMetrics();
  const { obraSelecionada } = useObraContext();

  const handleExportPDF = () => {
    exportDashboardPDF(operationalMetrics, obraSelecionada?.nome || 'Todas as Obras');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Dashboard Executivo</span>
            {obraSelecionada ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Centro de Custo: {obraSelecionada.nome}
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Consolidado: Todas as Obras
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500">
            {obraSelecionada
              ? `Demonstrativo financeiro, receitas e passivos específicos de "${obraSelecionada.nome}"`
              : 'Painel consolidado em tempo real: Obras, Frota, Faturamento de Medições e Gestão de Passivos'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchGlobal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
            title="Atualizar Indicadores"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loadingGlobal ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Exportar Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Grandes Cards de KPIs */}
      <DashboardCards metrics={globalMetrics} loading={loadingGlobal} />

      {/* Balanço Mensal: Receitas vs Despesas (Gráfico com Tailwind) */}
      <DashboardBalanco metrics={globalMetrics} />

      {/* Eficiência Operacional & Horas Trabalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EficienciaChart />
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Horímetro x Produção</h3>
          <GraficoHoras dados={operationalMetrics.dadosGraficoHoras} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
