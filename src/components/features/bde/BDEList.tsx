import React, { useState, useMemo } from 'react';
import { FileText, FileSpreadsheet, Plus, AlertCircle, AlertTriangle, FileDown, Compass } from 'lucide-react';
import { useBDE } from '../../../hooks/useBDE';
import { useEquipments } from '../../../hooks/useEquipments';
import { useEmpresaConfig } from '../../../hooks/useEmpresaConfig';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { BDEForm } from './BDEForm';
import { gerarRelatorioBDE, gerarExcelBDE } from '../../../utils/exportBDE';
import { exportBdePdf } from '../../../services/exportBdePdfService';
import type { DailyBulletin } from '../../../types/bde.types';

function renderStatusAprovacao(status?: string) {
  const s = status || 'PENDENTE';
  if (s === 'APROVADO') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">APROVADO</span>;
  if (s === 'REJEITADO') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">REJEITADO</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PENDENTE</span>;
}

export const BDEList: React.FC = () => {
  const { data, isLoading, error, refetch } = useBDE();
  const { data: equipments } = useEquipments();
  const { empresa } = useEmpresaConfig();
  const { obraSelecionada } = useObraContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const equipMap = useMemo(() => {
    const map = new Map<string, string>();
    equipments.forEach((eq) => map.set(eq.id, eq.code ? `${eq.code} - ${eq.name}` : eq.name));
    return map;
  }, [equipments]);

  if (isLoading) return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">Carregando boletins...</div>;
  if (error) return <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Boletins Diários de Equipamento (BDE)</h2>
          <p className="text-[11px] text-gray-500">Controle de horímetro, produção, estaqueamento e aprovação operacional</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => gerarRelatorioBDE(data, obraSelecionada?.nome)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-rose-600" /> Relatório
          </button>
          <button onClick={() => gerarExcelBDE(data, obraSelecionada?.nome)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
          </button>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm ml-1 cursor-pointer">
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
                <th className="p-3">Máquina / Operador</th>
                <th className="p-3">Estaqueamento</th>
                <th className="p-3 text-right">Produtivas</th>
                <th className="p-3 text-right">Ociosas</th>
                <th className="p-3">Atividades</th>
                <th className="p-3 text-center">Aprovação</th>
                <th className="p-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: DailyBulletin) => {
                const horasProd = item.horas_produtivas !== undefined ? Number(item.horas_produtivas) : (Number(item.total_hours) || 0);
                const horasOciosas = Number(item.horas_ociosas) || 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="p-3 font-mono font-medium text-gray-900">{item.date}</td>
                    <td className="p-3">
                      <div className="font-bold font-mono text-emerald-700">
                        {equipMap.get(item.equipment_id) || item.equipment_code || item.equipment_name || item.equipment_id.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-gray-500">{item.operador_nome || item.operator_name}</div>
                    </td>
                    <td className="p-3">
                      {item.estaca_inicial || item.estaca_final ? (
                        <div className="flex items-center gap-1 font-mono text-gray-800">
                          <Compass className="w-3 h-3 text-emerald-600" />
                          <span>{item.estaca_inicial || '—'} &rarr; {item.estaca_final || '—'}</span>
                        </div>
                      ) : <span className="text-gray-400 font-mono">—</span>}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{horasProd.toFixed(1)}h</td>
                    <td className="p-3 text-right font-mono">
                      {horasOciosas > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />+{horasOciosas.toFixed(1)}h
                        </span>
                      ) : <span className="text-emerald-700 font-semibold">0.0h</span>}
                    </td>
                    <td className="p-3 max-w-xs truncate">
                      {item.motivo_parada && <span className="font-semibold text-rose-700 mr-1">[{item.motivo_parada}]</span>}
                      <span className="text-gray-600">{item.service_description}</span>
                    </td>
                    <td className="p-3 text-center">{renderStatusAprovacao(item.status_aprovacao)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => exportBdePdf({
                          bde: item,
                          equipamentoNome: equipMap.get(item.equipment_id),
                          operadorNome: item.operador_nome || item.operator_name,
                          empresa,
                          obraNome: obraSelecionada?.nome
                        })}
                        className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg font-semibold cursor-pointer transition-colors shadow-2xs"
                        title="Exportar BDE Individual em PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PDF</span>
                      </button>
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
