import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Plus, AlertCircle, AlertTriangle } from 'lucide-react';
import { useBDE } from '../../../hooks/useBDE';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { BDEForm } from './BDEForm';
import { gerarRelatorioBDE, gerarExcelBDE } from '../../../utils/exportBDE';
import type { DailyBulletin } from '../../../types/bde.types';

export const BDEList: React.FC = () => {
  const { data, isLoading, error, refetch } = useBDE();
  const { obraSelecionada } = useObraContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calcularHorasJornada = (inicio?: string, fim?: string) => {
    if (!inicio || !fim) return null;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, Number((mins / 60).toFixed(1)));
  };

  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">Carregando boletins...</div>;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Boletins Diários de Equipamento (BDE)</h2>
          <p className="text-[11px] text-gray-500">Cruzamento operacional: Horímetro Máquina vs Jornada do Operador</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => gerarRelatorioBDE(data, obraSelecionada?.nome)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold">
            <FileText className="w-3.5 h-3.5 text-rose-600" /> PDF
          </button>
          <button onClick={() => gerarExcelBDE(data, obraSelecionada?.nome)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
          </button>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm ml-1">
            <Plus className="w-3.5 h-3.5" /> Novo BDE
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-10 text-center text-gray-400">Nenhum boletim registrado nesta obra.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Máquina</th>
                <th className="p-3">Operador</th>
                <th className="p-3 text-right">Jornada (h)</th>
                <th className="p-3 text-right">Máquina (h)</th>
                <th className="p-3 text-right">Ociosidade</th>
                <th className="p-3">Motivo / Descrição</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: DailyBulletin) => {
                const horasJornada = calcularHorasJornada(item.hora_inicio_jornada, item.hora_fim_jornada);
                const horasMaq = Number(item.total_hours) || 0;
                const ociosidade = horasJornada !== null ? Math.max(0, Number((horasJornada - horasMaq).toFixed(1))) : 0;
                const temOciosidade = ociosidade > 0.5;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-mono font-medium text-gray-900">{item.date}</td>
                    <td className="p-3 font-bold font-mono text-emerald-700">{item.equipment_code || item.equipment_id.slice(0, 8)}</td>
                    <td className="p-3 font-medium text-gray-800">{item.operador_nome || item.operator_name}</td>
                    <td className="p-3 text-right font-mono">{horasJornada !== null ? `${horasJornada.toFixed(1)}h` : '-'}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{horasMaq.toFixed(1)}h</td>
                    <td className="p-3 text-right font-mono">
                      {temOciosidade ? (
                        <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          +{ociosidade.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0.0h</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate">
                      {item.motivo_parada ? (
                        <span className="font-semibold text-rose-700 mr-1.5">[{item.motivo_parada}]</span>
                      ) : null}
                      <span className="text-gray-500">{item.service_description}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lançar Boletim Diário de Equipamento (BDE)">
        <BDEForm onSuccess={() => { setIsModalOpen(false); refetch(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
