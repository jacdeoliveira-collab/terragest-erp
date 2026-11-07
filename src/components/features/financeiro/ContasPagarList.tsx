import React from 'react';
import { Plus, Check, AlertTriangle, CheckCircle2, Pencil, HandCoins } from 'lucide-react';
import { extrairInfoEmprestimo } from '../../../utils/emprestimoHelper';
import type { ContaPagarItem } from '../../../types/contasPagar.types';
import { ContasPagarKpiCards } from './ContasPagarKpiCards';

interface ContasPagarListProps {
  data: ContaPagarItem[];
  isLoading: boolean;
  error: string | null;
  onAbrirNova: () => void;
  onAbrirBaixa: (item: ContaPagarItem) => void;
  onAbrirEditar: (item: ContaPagarItem) => void;
}

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ContasPagarList: React.FC<ContasPagarListProps> = ({
  data, isLoading, error, onAbrirNova, onAbrirBaixa, onAbrirEditar
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [filtroCard, setFiltroCard] = React.useState<'TODOS' | 'PENDENTE' | 'PAGO'>('TODOS');

  const totalAPagarAberto = data
    .filter((d) => d.status === 'PENDENTE')
    .reduce((acc, d) => acc + Number(d.valor), 0);

  const totalPagoMes = data
    .filter((d) => d.status === 'PAGO' && (d.data_pagamento?.startsWith(mesAtual) || d.data_vencimento.startsWith(mesAtual)))
    .reduce((acc, d) => acc + Number(d.valor), 0);

  const listaFiltrada = React.useMemo(() => {
    if (filtroCard === 'PENDENTE') return data.filter((d) => d.status === 'PENDENTE');
    if (filtroCard === 'PAGO') return data.filter((d) => d.status === 'PAGO');
    return data;
  }, [data, filtroCard]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left text-xs">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Contas a Pagar (Gestão de Passivos & Empréstimos)</h2>
          <p className="text-gray-500 mt-0.5">Controle de passivos com fornecedores de diesel, óleo, peças, manutenções e empréstimos</p>
        </div>
        <button onClick={onAbrirNova} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /><span>Nova Conta a Pagar</span>
        </button>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /><span>{error}</span>
        </div>
      )}

      <ContasPagarKpiCards
        totalAPagarAberto={totalAPagarAberto}
        totalPagoMes={totalPagoMes}
        filtroCard={filtroCard}
        onToggleFiltro={(tipo) => setFiltroCard((f) => (f === tipo ? 'TODOS' : tipo))}
      />

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Carregando contas a pagar...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          {data.length === 0 ? 'Nenhuma conta a pagar registrada neste centro de custo.' : 'Nenhum registro encontrado para este filtro.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Descrição / Fornecedor / Ações</th>
                <th className="p-3">Quando Pagar (Venc.)</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Centro de Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {listaFiltrada.map((item) => {
                const isAtrasado = item.status === 'PENDENTE' && item.data_vencimento < hoje;
                const isPago = item.status === 'PAGO';
                const emp = extrairInfoEmprestimo(item);

                return (
                  <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${isAtrasado ? 'bg-rose-50/30' : ''}`}>
                    <td className="p-3 min-w-[230px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-gray-900">{item.descricao}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isPago ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isAtrasado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isPago ? 'PAGO' : isAtrasado ? 'EM ATRASO' : 'PENDENTE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">{item.fornecedor}</div>
                      {emp.isEmprestimo && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                          <HandCoins className="w-3 h-3 text-amber-700" />
                          Empréstimo de: {emp.credorNome} {emp.dataEmprestimo ? `• Pegou em ${new Date(emp.dataEmprestimo + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-gray-100">
                        {!isPago ? (
                          <button onClick={() => onAbrirBaixa(item)} className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /><span>Pagar</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5"><Check className="w-3 h-3" /> Pago</span>
                        )}
                        <button onClick={() => onAbrirEditar(item)} title="Alterar Despesa / Empréstimo" className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer">
                          <Pencil className="w-3 h-3" /><span>Editar</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className={isAtrasado ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-gray-700'}>
                        {new Date(item.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                        {isAtrasado && <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md">VENCIDA</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{formatBRL(Number(item.valor))}</td>
                    <td className="p-3 font-semibold text-gray-600">{item.categoria.replace('_', ' ')}</td>
                    <td className="p-3 text-gray-700">{item.obra_nome || <span className="text-gray-400 italic">Geral / Administrativo</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
