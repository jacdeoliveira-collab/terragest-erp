import React, { useState } from 'react';
import { Plus, ReceiptText, Clock, AlertCircle, CheckCircle, Check } from 'lucide-react';
import { useMedicoes } from '../../../hooks/useMedicoes';
import { Modal } from '../../ui/Modal';
import { MedicaoForm } from './MedicaoForm';
import type { MedicaoItem, StatusPagamentoMedicao } from '../../../types/faturamento.types';

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function renderStatusBadge(status: StatusPagamentoMedicao) {
  if (status === 'PAGO') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit"><Check className="w-3 h-3" /> PAGO</span>;
  }
  if (status === 'CANCELADO') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-gray-100 text-gray-700 border-gray-200">CANCELADO</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3 text-amber-500" /> AGUARDANDO_PAGAMENTO</span>;
}

export const MedicoesList: React.FC = () => {
  const { data, isLoading, error, refetch, atualizarStatusPagamento } = useMedicoes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalAguardando = data.filter((d) => d.status_pagamento === 'AGUARDANDO_PAGAMENTO').reduce((acc, d) => acc + d.valor_total, 0);
  const totalPago = data.filter((d) => d.status_pagamento === 'PAGO').reduce((acc, d) => acc + d.valor_total, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Medição & Faturamento de Contratos</h2>
          <p className="text-xs text-gray-500">Consolidação de BDEs aprovados por competência para cobrança e faturamento de clientes</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Medição</span>
        </button>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Medições Emitidas</span>
          <div className="text-lg font-bold font-mono text-gray-900">{data.length} lotes</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Aguardando Pagamento</span>
          <div className="text-lg font-bold font-mono text-amber-700">{formatBRL(totalAguardando)}</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Liquidado (Pago)</span>
          <div className="text-lg font-bold font-mono text-emerald-700">{formatBRL(totalPago)}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Carregando faturamento...</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center">
          <ReceiptText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Nenhuma medição de faturamento gerada</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Clique em "Nova Medição" para agrupar BDEs aprovados de uma obra em lote mensal.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Medição / Mês</th>
                <th className="p-3">Obra & Cliente</th>
                <th className="p-3 text-right">Horas Prod.</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: MedicaoItem) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-800">
                    <div>{item.numero_medicao}</div>
                    <div className="text-[10px] font-normal text-gray-400 font-sans">Comp: {item.competencia}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">{item.obra_nome}</div>
                    <div className="text-[11px] text-gray-500">{item.cliente_nome}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900">{Number(item.total_horas_produtivas).toFixed(1)} h</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatBRL(Number(item.valor_total))}</td>
                  <td className="p-3 font-mono text-gray-600">{new Date(item.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{renderStatusBadge(item.status_pagamento)}</td>
                  <td className="p-3 text-center">
                    {item.status_pagamento === 'AGUARDANDO_PAGAMENTO' && (
                      <button
                        onClick={() => atualizarStatusPagamento(item.id, 'PAGO')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                        title="Marcar como Pago"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Baixar Pagamento</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Medição de Contrato (Faturamento de BDEs)">
        <MedicaoForm onSuccess={() => { setIsModalOpen(false); refetch(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
