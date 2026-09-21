import React, { useState } from 'react';
import { ClipboardCheck, FileText, FileSpreadsheet, Plus, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useChecklists } from '../../../hooks/useChecklists';
import { Modal } from '../../ui/Modal';
import { ChecklistForm } from './ChecklistForm';
import type { ChecklistItem } from '../../../types/checklist.types';

export const ChecklistList: React.FC = () => {
  const { data, isLoading, error, refetch } = useChecklists();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando inspeções pré-operacionais...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Inspeções Pré-Operacionais (Checklist)</h2>
          <p className="text-xs text-gray-500">Validação diária de níveis, vazamentos e segurança</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('Exportar Checklists PDF', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => console.log('Exportar Checklists Excel', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Inspeção</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum checklist registrado hoje</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Realize a inspeção pré-operacional diária antes de liberar a máquina para o canteiro.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Inspeção</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Máquina</th>
                <th className="p-3.5">Operador</th>
                <th className="p-3.5 text-center">Óleo Motor</th>
                <th className="p-3.5 text-center">Vazamentos</th>
                <th className="p-3.5 text-center">Status Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: ChecklistItem) => {
                const reprovado = !item.status_geral_aprovado;
                return (
                  <tr key={item.id} className={`transition-colors ${reprovado ? 'bg-rose-50/50' : 'hover:bg-gray-50/60'}`}>
                    <td className="p-3.5 font-mono font-medium text-gray-900">{item.data}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{item.maquina_codigo || item.maquina_nome || '-'}</td>
                    <td className="p-3.5">{item.operador_nome || 'Não informado'}</td>
                    <td className="p-3.5 text-center">{item.nivel_oleo_ok ? 'OK' : <span className="text-rose-600 font-bold">BAIXO</span>}</td>
                    <td className="p-3.5 text-center">{item.vazamentos_ok ? 'Isento' : <span className="text-rose-600 font-bold">DETECTADO</span>}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${reprovado ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {reprovado ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {reprovado ? 'REPROVADO / INOPERANTE' : 'LIBERADO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Checklist Pré-Operacional">
        <ChecklistForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
