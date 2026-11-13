import React, { useState } from 'react';
import { FileText, Gauge } from 'lucide-react';
import { OrcamentoList } from '../components/features/comercial/OrcamentoList';
import { ServicoHorimetroList } from '../components/features/comercial/ServicoHorimetroList';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const Comercial: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'horimetros' | 'orcamentos'>('horimetros');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Serviço por Horímetro</h1>
          <p className="text-xs text-gray-500">
            Locação por horímetro, medição com fotos, comprovantes de diesel e orçamentos
          </p>
        </div>

        <div className="flex flex-wrap items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold w-full sm:w-auto gap-1">
          <button
            onClick={() => setAbaAtiva('horimetros')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'horimetros'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border border-transparent'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Serviços por Horímetro</span>
          </button>

          <button
            onClick={() => setAbaAtiva('orcamentos')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'orcamentos'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Orçamentos</span>
          </button>
        </div>
      </div>

      <ErrorBoundary fallbackTitle="Erro ao carregar módulo de serviços por horímetro">
        {abaAtiva === 'horimetros' && <ServicoHorimetroList />}
        {abaAtiva === 'orcamentos' && <OrcamentoList onIrParaHorimetros={() => setAbaAtiva('horimetros')} />}
      </ErrorBoundary>
    </div>
  );
};

export default Comercial;
