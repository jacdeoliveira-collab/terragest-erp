import React from 'react';
import { Building2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useEmpresaConfig } from '../hooks/useEmpresaConfig';
import { EmpresaConfigForm } from '../components/features/empresa/EmpresaConfigForm';

export const EmpresaSettings: React.FC = () => {
  const { empresa, isLoading, isSaving, error, success, salvarConfiguracoes, refetch } = useEmpresaConfig();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Minha Empresa</h1>
            <p className="text-xs text-gray-500">
              Configure os dados cadastrais da construtora que constarão nos relatórios e boletins (PDF).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {empresa?.plano && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plano {empresa.plano}</span>
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-gray-400 bg-white border border-gray-200 rounded-2xl">
          Carregando dados da empresa...
        </div>
      ) : (
        <EmpresaConfigForm
          empresa={empresa}
          isSaving={isSaving}
          error={error}
          success={success}
          onSave={salvarConfiguracoes}
        />
      )}
    </div>
  );
};

export default EmpresaSettings;
