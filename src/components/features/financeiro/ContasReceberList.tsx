import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MedicaoItem } from '../../../types/faturamento.types';
import { ContasReceberRowItem } from './ContasReceberRowItem';
import { ContasReceberKpiCards } from './ContasReceberKpiCards';
import { FiltroExportacaoBar } from '../../common/FiltroExportacaoBar';
import { exportarContasReceberExcel, exportarContasReceberPDF } from '../../../utils/exportContasReceber';

interface ContasReceberListProps {
  data: MedicaoItem[];
  isLoading: boolean;
  error: string | null;
  onAbrirBaixa: (item: MedicaoItem) => void;
  onAbrirHaver: (item: MedicaoItem) => void;
  onAbrirAsaas?: (item: MedicaoItem) => void;
  onExcluir?: (item: MedicaoItem) => void;
}

const STATUS_OPTIONS = [
  { valor: 'TODOS', label: 'Todos os Status' },
  { valor: 'QUITADOS', label: 'Quitados / Pagos' },
  { valor: 'PENDENTES', label: 'Pendentes / Em Aberto' }
];

export const ContasReceberList: React.FC<ContasReceberListProps> = ({
  data, isLoading, error, onAbrirBaixa, onAbrirHaver, onAbrirAsaas, onExcluir
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const mesAtual = new Date().toISOString().slice(0, 7);

  const [filtroCard, setFiltroCard] = useState<'TODOS' | 'PENDENTE' | 'RECEBIDO'>('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'QUITADOS' | 'PENDENTES'>('TODOS');

  const totalAReceber = useMemo(() => data.filter((d) => d.status_pagamento !== 'PAGO').reduce((acc, d) => {
    const s = d.saldo_restante !== undefined ? Number(d.saldo_restante) : Number(d.valor_total);
    return acc + (s > 0 ? s : 0);
  }, 0), [data]);

  const recebidoNoMes = useMemo(() => data.reduce((acc, d) => {
    let s = 0;
    if (d.status_pagamento === 'PAGO' && (d.data_pagamento?.startsWith(mesAtual) || d.competencia === mesAtual)) {
      s += Number(d.valor_total);
    } else if (Number(d.valor_adiantamento || 0) > 0) {
      s += Number(d.valor_adiantamento);
    }
    return acc + s;
  }, 0), [data, mesAtual]);

  const listaFiltrada = useMemo(() => {
    return data.filter((d) => {
      if (filtroCard === 'PENDENTE' && d.status_pagamento === 'PAGO') return false;
      if (filtroCard === 'RECEBIDO' && !(d.status_pagamento === 'PAGO' || Number(d.valor_adiantamento || 0) > 0)) return false;
      if (statusFiltro === 'QUITADOS' && d.status_pagamento !== 'PAGO') return false;
      if (statusFiltro === 'PENDENTES' && d.status_pagamento === 'PAGO') return false;
      const refData = d.data_vencimento || d.data_emissao || '';
      if (dataInicio && refData && refData < dataInicio) return false;
      if (dataFim && refData && refData > dataFim) return false;
      return true;
    });
  }, [data, filtroCard, statusFiltro, dataInicio, dataFim]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left text-xs space-y-3 p-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">Contas a Receber (Gestão de Inadimplência, Boletos Asaas & Haveres)</h2>
        <p className="text-gray-500 mt-0.5">Conciliação de faturamentos, emissão de Boleto/PIX via Asaas, controle de haveres e recibos</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /><span>{error}</span>
        </div>
      )}

      <ContasReceberKpiCards
        totalAReceber={totalAReceber} recebidoNoMes={recebidoNoMes} filtroCard={filtroCard}
        onToggleFiltro={(tipo) => setFiltroCard((f) => (f === tipo ? 'TODOS' : tipo))}
      />

      <FiltroExportacaoBar
        dataInicio={dataInicio} setDataInicio={setDataInicio}
        dataFim={dataFim} setDataFim={setDataFim}
        status={statusFiltro} setStatus={setStatusFiltro} statusOptions={STATUS_OPTIONS}
        onExportarExcel={() => exportarContasReceberExcel(listaFiltrada)}
        onExportarPdf={() => exportarContasReceberPDF(listaFiltrada)}
        totalFiltrados={listaFiltrada.length}
      />

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Carregando contas a receber...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          {data.length === 0 ? 'Nenhum título a receber registrado.' : 'Nenhum registro encontrado para este filtro.'}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Cliente / Obra / Ações</th><th className="p-3 text-right">Saldo a Receber</th>
                <th className="p-3">Vencimento</th><th className="p-3">Mês Ref.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {listaFiltrada.map((item) => (
                <ContasReceberRowItem
                  key={item.id} item={item} hoje={hoje}
                  onAbrirBaixa={onAbrirBaixa} onAbrirHaver={onAbrirHaver}
                  onAbrirAsaas={onAbrirAsaas} onExcluir={onExcluir}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
