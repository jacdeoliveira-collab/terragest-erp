import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MedicaoItem } from '../../../types/faturamento.types';
import { ContasReceberRowItem } from './ContasReceberRowItem';
import { ContasReceberKpiCards } from './ContasReceberKpiCards';

interface ContasReceberListProps {
  data: MedicaoItem[];
  isLoading: boolean;
  error: string | null;
  onAbrirBaixa: (item: MedicaoItem) => void;
  onAbrirHaver: (item: MedicaoItem) => void;
  onExcluir?: (item: MedicaoItem) => void;
}

export const ContasReceberList: React.FC<ContasReceberListProps> = ({
  data,
  isLoading,
  error,
  onAbrirBaixa,
  onAbrirHaver,
  onExcluir
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Soma de todos os saldos em aberto pendentes de quitação
  const totalAReceber = data
    .filter((d) => d.status_pagamento !== 'PAGO')
    .reduce((acc, d) => {
      const saldo = d.saldo_restante !== undefined ? Number(d.saldo_restante) : Number(d.valor_total);
      return acc + (saldo > 0 ? saldo : 0);
    }, 0);

  // Soma do que foi recebido no mês (quitação integral ou soma de haveres)
  const recebidoNoMes = data.reduce((acc, d) => {
    let soma = 0;
    if (d.status_pagamento === 'PAGO' && (d.data_pagamento?.startsWith(mesAtual) || d.competencia === mesAtual)) {
      soma += Number(d.valor_total);
    } else if (Number(d.valor_adiantamento || 0) > 0) {
      soma += Number(d.valor_adiantamento);
    }
    return acc + soma;
  }, 0);

  const [filtroCard, setFiltroCard] = React.useState<'TODOS' | 'PENDENTE' | 'RECEBIDO'>('TODOS');

  const listaFiltrada = React.useMemo(() => {
    if (filtroCard === 'PENDENTE') {
      return data.filter((d) => d.status_pagamento !== 'PAGO');
    }
    if (filtroCard === 'RECEBIDO') {
      return data.filter((d) => d.status_pagamento === 'PAGO' || Number(d.valor_adiantamento || 0) > 0);
    }
    return data;
  }, [data, filtroCard]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left text-xs">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Contas a Receber (Gestão de Inadimplência & Haveres)</h2>
        <p className="text-gray-500 mt-0.5">Conciliação de faturamentos, controle de haveres, emissão de recibos e quitação</p>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Interativos */}
      <ContasReceberKpiCards
        totalAReceber={totalAReceber}
        recebidoNoMes={recebidoNoMes}
        filtroCard={filtroCard}
        onToggleFiltro={(tipo) => setFiltroCard((f) => (f === tipo ? 'TODOS' : tipo))}
      />

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Carregando contas a receber...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          {data.length === 0 ? 'Nenhum título a receber registrado.' : 'Nenhum registro encontrado para este filtro.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Cliente / Obra</th>
                <th className="p-3">Mês Ref.</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3 text-right">Saldo a Receber</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {listaFiltrada.map((item) => (
                <ContasReceberRowItem
                  key={item.id}
                  item={item}
                  hoje={hoje}
                  onAbrirBaixa={onAbrirBaixa}
                  onAbrirHaver={onAbrirHaver}
                  onExcluir={onExcluir}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
