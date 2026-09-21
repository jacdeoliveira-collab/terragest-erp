import React from 'react';
import { FileText } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useObras } from '../hooks/useObras';
import { KpiDashboardGrid } from '../components/features/dashboard/KpiDashboardGrid';
import { GraficoHoras } from '../components/dashboard/GraficoHoras';
import { EficienciaChart } from '../components/features/dashboard/EficienciaChart';
import { exportDashboardPDF } from '../services/exportDashboardPdf';

export const Dashboard: React.FC = () => {
  const { metrics, loading } = useDashboardMetrics();
  const { obraAtual } = useObras();

  const handleExportPDF = () => {
    exportDashboardPDF(metrics, obraAtual?.nome || 'Todas as Obras');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard Executivo & Operacional</h1>
          <p className="text-xs text-gray-500">Visão gerencial consolidada: Frota, RH, Combustível e Manutenção Preventiva</p>
        </div>

        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Exportar Relatório PDF</span>
        </button>
      </div>

      <KpiDashboardGrid metrics={metrics} loading={loading} />

      <EficienciaChart />

      <div className="grid grid-cols-1 gap-6">
        <GraficoHoras dados={metrics.dadosGraficoHoras} />
      </div>
    </div>
  );
};

export default Dashboard;
