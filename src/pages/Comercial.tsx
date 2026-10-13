import React, { useState } from 'react';
import { Users, FileText, Gauge } from 'lucide-react';
import { ClienteList } from '../components/features/comercial/ClienteList';
import { OrcamentoList } from '../components/features/comercial/OrcamentoList';
import { ServicoHorimetroList } from '../components/features/comercial/ServicoHorimetroList';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const Comercial: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'horimetros' | 'orcamentos' | 'clientes'>('horimetros');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Comercial & Gestão de Máquinas</h1>
          <p className="text-xs text-gray-500">
            Locação por horímetro, medição com fotos, comprovantes de diesel e orçamentos
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('horimetros')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'horimetros' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span>Serviços por Horímetro</span>
          </button>

          <button
            onClick={() => setAbaAtiva('orcamentos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'orcamentos' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Orçamentos</span>
          </button>

          <button
            onClick={() => setAbaAtiva('clientes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'clientes' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Clientes</span>
          </button>
        </div>
      </div>

      <ErrorBoundary fallbackTitle="Erro ao carregar módulo comercial">
        {abaAtiva === 'horimetros' && <ServicoHorimetroList />}
        {abaAtiva === 'orcamentos' && <OrcamentoList />}
        {abaAtiva === 'clientes' && <ClienteList />}
      </ErrorBoundary>
    </div>
  );
};

export default Comercial;
