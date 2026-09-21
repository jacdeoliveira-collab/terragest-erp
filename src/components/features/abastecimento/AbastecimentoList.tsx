import React, { useState } from 'react';
import { Fuel, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useAbastecimentos } from '../../../hooks/useAbastecimentos';
import { Modal } from '../../ui/Modal';
import { AbastecimentoForm } from './AbastecimentoForm';
import type { AbastecimentoItem } from '../../../types/abastecimento.types';

export const AbastecimentoList: React.FC = () => {
  const { data, isLoading, error, refetch } = useAbastecimentos();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando registros de abastecimento de combustível...
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
          <h2 className="text-base font-bold text-gray-900">Controle de Abastecimentos & Diesel</h2>
          <p className="text-xs text-gray-500">Apontamento de combustível, horímetro e custos por máquina</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('Exportar Abastecimentos PDF', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => console.log('Exportar Abastecimentos Excel', data)}
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
            <span>Novo Abastecimento</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <Fuel className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum registro de abastecimento nesta obra</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Cadastre os abastecimentos de diesel S10/S500 para acompanhar os custos operacionais reais.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Abastecimento</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Máquina</th>
                <th className="p-3.5">Combustível</th>
                <th className="p-3.5 text-right">Horímetro</th>
                <th className="p-3.5 text-right">Litros</th>
                <th className="p-3.5 text-right">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: AbastecimentoItem) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-gray-900">{item.data}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700">
                    {item.maquina_codigo || item.maquina_nome || '-'}
                  </td>
                  <td className="p-3.5 text-gray-600">{item.tipo_combustivel.replace('_', ' ')}</td>
                  <td className="p-3.5 text-right font-mono text-gray-600">{item.horimetro_momento.toFixed(1)}h</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                    {item.quantidade_litros.toFixed(1)} L
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                    R$ {item.valor_total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Abastecimento">
        <AbastecimentoForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
