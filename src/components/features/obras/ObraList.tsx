import React, { useState } from 'react';
import { HardHat, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { ObraForm } from './ObraForm';
import { gerarRelatorioObrasPDF, gerarExcelObras } from '../../../utils/exportObras';
import type { Obra } from '../../../types/obras.types';

export const ObraList: React.FC = () => {
  const { obras, loading, error, recarregarObras } = useObraContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = () => {
    setIsModalOpen(false);
    recarregarObras();
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando canteiros de obras e centros de custo...
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
          <h2 className="text-base font-bold text-gray-900">Centros de Custo & Canteiros de Obras</h2>
          <p className="text-xs text-gray-500">Gestão de frentes de serviço para rateio operacional de frotas e BDEs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => gerarRelatorioObrasPDF(obras)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => gerarExcelObras(obras)}
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
            <span>Nova Obra</span>
          </button>
        </div>
      </div>

      {obras.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <HardHat className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhuma obra cadastrada nesta empresa</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Cadastre os canteiros de trabalho para alocar os apontamentos de máquinas e os abastecimentos.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Obra</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Nome da Obra</th>
                <th className="p-3.5">Cliente / Contratante</th>
                <th className="p-3.5">Localização</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {obras.map((obra: Obra) => {
                const isAtiva = obra.status === 'ATIVA' || obra.status === 'EM_ANDAMENTO';
                const isParalisada = obra.status === 'PARALISADA';

                return (
                  <tr key={obra.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5 font-semibold text-gray-900">{obra.nome}</td>
                    <td className="p-3.5 text-gray-600">{obra.cliente || '-'}</td>
                    <td className="p-3.5 text-gray-500">{obra.localizacao || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isAtiva
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isParalisada
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {isAtiva ? 'ATIVA' : isParalisada ? 'PARALISADA' : 'CONCLUÍDA'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Centro de Custo / Obra">
        <ObraForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
