import React from 'react';
import { Clock, DollarSign, FileCheck, AlertCircle } from 'lucide-react';
import type { BDEItemMedicao } from '../../../types/faturamento.types';

interface MedicaoResumoTabProps {
  bdes: BDEItemMedicao[];
  totalHoras: number;
  valorTotal: number;
  setValorTotal: (val: number) => void;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const MedicaoResumoTab: React.FC<MedicaoResumoTabProps> = ({
  bdes,
  totalHoras,
  valorTotal,
  setValorTotal
}) => {
  if (bdes.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl my-2 text-xs">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h4 className="font-bold text-gray-800">Nenhum BDE Aprovado Carregado</h4>
        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
          Retorne à aba "1. Filtro & Obra" e clique no botão "Localizar BDEs Aprovados" para consolidar as horas de campo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-xs text-left">
      {/* Resumo Consolidado */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
            <FileCheck className="w-3 h-3 text-emerald-600" /> BDEs no Lote
          </span>
          <div className="text-lg font-bold font-mono text-gray-900">{bdes.length} boletins</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Horas Produtivas
          </span>
          <div className="text-lg font-bold font-mono text-emerald-700">{totalHoras.toFixed(1)} h</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Total Estimado
          </span>
          <div className="text-lg font-bold font-mono text-blue-700">{formatBRL(valorTotal)}</div>
        </div>
      </div>

      {/* Tabela de BDEs */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200 sticky top-0">
            <tr>
              <th className="py-2 px-3">Data</th>
              <th className="py-2 px-3">Máquina / Ativo</th>
              <th className="py-2 px-3 text-right">Horas Prod.</th>
              <th className="py-2 px-3 text-right">Tarifa (R$/h)</th>
              <th className="py-2 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-mono">
            {bdes.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="py-1.5 px-3 text-gray-900">{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-800">
                  {item.equipment_code ? `${item.equipment_code} - ${item.equipment_name}` : item.equipment_name}
                </td>
                <td className="py-1.5 px-3 text-right font-bold text-gray-900">{item.horas_produtivas.toFixed(1)}h</td>
                <td className="py-1.5 px-3 text-right text-gray-600">{formatBRL(item.valor_hora_equipamento)}</td>
                <td className="py-1.5 px-3 text-right font-bold text-blue-700">{formatBRL(item.subtotal_calculado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ajuste do Valor Total da Medição */}
      <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
        <div>
          <span className="font-bold text-emerald-950 block">Valor Final Faturável da Medição (R$)</span>
          <span className="text-[11px] text-emerald-700">Calculado automaticamente com base na soma dos subtotais (ajustável).</span>
        </div>
        <input
          type="number"
          step="0.01"
          required
          value={valorTotal}
          onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
          className="w-40 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-right text-emerald-900 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
