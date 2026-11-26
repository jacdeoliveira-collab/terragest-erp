import React, { useState, useMemo } from 'react';
import { HandCoins, Plus, CheckCircle2, Check, Pencil, Calendar, UserCheck, Split } from 'lucide-react';
import { useContasPagar } from '../../../hooks/useContasPagar';
import { extrairInfoEmprestimo } from '../../../utils/emprestimoHelper';
import { extrairAmortizacoesEmprestimo } from '../../../utils/emprestimoAmortizacaoHelper';
import { ContaPagarFormModal } from './ContaPagarFormModal';
import { EditarContaPagarModal } from './EditarContaPagarModal';
import { BaixaContaPagarModal } from './BaixaContaPagarModal';
import { EmprestimoAmortizacaoModal } from './EmprestimoAmortizacaoModal';
import type { ContaPagarItem, FormaPagamentoDespesa } from '../../../types/contasPagar.types';

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const EmprestimosTab: React.FC = () => {
  const { data, isLoading, refetch, criarContaPagar, atualizarContaPagar, darBaixa } = useContasPagar();
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [itemBaixa, setItemBaixa] = useState<ContaPagarItem | null>(null);
  const [itemAmortizarId, setItemAmortizarId] = useState<string | null>(null);
  const [itemEditar, setItemEditar] = useState<ContaPagarItem | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTE' | 'PAGO'>('TODOS');
  const hoje = new Date().toISOString().slice(0, 10);

  const emprestimos = useMemo(() => {
    return data
      .map((item) => ({ item, info: extrairInfoEmprestimo(item), amort: extrairAmortizacoesEmprestimo(item) }))
      .filter(({ info }) => info.isEmprestimo);
  }, [data]);

  const filtrados = useMemo(() => {
    if (filtroStatus === 'PENDENTE') return emprestimos.filter((e) => e.item.status === 'PENDENTE');
    if (filtroStatus === 'PAGO') return emprestimos.filter((e) => e.item.status === 'PAGO');
    return emprestimos;
  }, [emprestimos, filtroStatus]);

  const totalAberto = emprestimos.reduce((acc, e) => acc + e.amort.saldoRestante, 0);
  const totalDevolvido = emprestimos.reduce((acc, e) => acc + e.amort.totalAmortizado, 0);
  const itemAmortizarAtivo = emprestimos.find((e) => e.item.id === itemAmortizarId) || null;

  const handleConfirmarBaixa = async (id: string, dataPag: string, formaPag: FormaPagamentoDespesa, contaId?: string) => {
    return await darBaixa(id, dataPag, formaPag, contaId);
  };

  return (
    <div className="space-y-5 text-xs text-left">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2"><HandCoins className="w-5 h-5 text-amber-600" /><span>Controle de Empréstimos & Recursos Tomados</span></h2>
            <p className="text-gray-500 mt-0.5">Controle completo com baixas parciais, parcelas ou abatimento com despesas do dia a dia</p>
          </div>
          <button type="button" onClick={() => setModalNovoOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /><span>Registrar Empréstimo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-gray-200">
          <button type="button" onClick={() => setFiltroStatus((f) => f === 'PENDENTE' ? 'TODOS' : 'PENDENTE')} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${filtroStatus === 'PENDENTE' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
            <p className="text-[10px] font-bold uppercase text-amber-800">Em Aberto (A Pagar / Devolver)</p>
            <p className="text-lg font-black font-mono text-amber-700 mt-0.5">{formatBRL(totalAberto)}</p>
          </button>
          <button type="button" onClick={() => setFiltroStatus((f) => f === 'PAGO' ? 'TODOS' : 'PAGO')} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${filtroStatus === 'PAGO' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
            <p className="text-[10px] font-bold uppercase text-emerald-800">Já Devolvido / Amortizado</p>
            <p className="text-lg font-black font-mono text-emerald-700 mt-0.5">{formatBRL(totalDevolvido)}</p>
          </button>
          <button type="button" onClick={() => setFiltroStatus('TODOS')} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${filtroStatus === 'TODOS' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-gray-200'}`}>
            <p className={`text-[10px] font-bold uppercase ${filtroStatus === 'TODOS' ? 'text-amber-400' : 'text-gray-500'}`}>Total de Empréstimos</p>
            <p className="text-lg font-black font-mono mt-0.5">{emprestimos.length} registro(s)</p>
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Carregando empréstimos...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum empréstimo registrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Credor & Ações</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Saldo / Progresso</th>
                  <th className="p-3">Finalidade</th>
                  <th className="p-3">Data em que pegou</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(({ item, info, amort }) => {
                  const isPago = item.status === 'PAGO';
                  const isVencido = !isPago && item.data_vencimento < hoje;
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-3 min-w-[250px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-gray-900">{info.credorNome}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${isPago ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isVencido ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                            {isPago ? 'QUITADO' : isVencido ? 'VENCIDO' : amort.totalAmortizado > 0 ? 'PARCIAL' : 'A PAGAR'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 mt-1 border-t border-gray-100">
                          <button type="button" onClick={() => setItemAmortizarId(item.id)} className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1">
                            <Split className="w-3 h-3" /><span>{isPago ? `Parcelas (${amort.historico.length})` : 'Abater / Parcela'}</span>
                          </button>
                          {!isPago ? (
                            <button type="button" onClick={() => setItemBaixa(item)} className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /><span>Quitar Tudo</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5"><Check className="w-3 h-3" /> Pago</span>
                          )}
                          <button type="button" onClick={() => setItemEditar(item)} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer"><Pencil className="w-3 h-3" /><span>Editar</span></button>
                        </div>
                      </td>
                      <td className="p-3 font-mono"><span className={isVencido ? 'text-rose-600 font-bold' : 'text-gray-900 font-semibold'}>{new Date(item.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span></td>
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-gray-900">{formatBRL(amort.saldoRestante)}</div>
                        {amort.totalAmortizado > 0 && (
                          <div className="text-[10px] text-emerald-700">Pago: {formatBRL(amort.totalAmortizado)} / {formatBRL(amort.valorOriginal)}</div>
                        )}
                      </td>
                      <td className="p-3"><div className="font-semibold text-gray-800">{item.descricao}</div><div className="text-[10px] text-gray-500">{item.categoria.replace('_', ' ')} • {item.obra_nome || 'Geral'}</div></td>
                      <td className="p-3 font-mono text-gray-700"><span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{info.dataEmprestimo ? new Date(info.dataEmprestimo + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContaPagarFormModal isOpen={modalNovoOpen} onClose={() => setModalNovoOpen(false)} onSalvar={criarContaPagar} defaultEmprestimo />
      <EditarContaPagarModal isOpen={!!itemEditar} onClose={() => setItemEditar(null)} conta={itemEditar} onSalvar={atualizarContaPagar} />
      <BaixaContaPagarModal isOpen={!!itemBaixa} onClose={() => setItemBaixa(null)} conta={itemBaixa} onConfirmar={handleConfirmarBaixa} />
      <EmprestimoAmortizacaoModal isOpen={!!itemAmortizarAtivo} onClose={() => setItemAmortizarId(null)} emprestimo={itemAmortizarAtivo?.item || null} credorNome={itemAmortizarAtivo?.info.credorNome || ''} onSuccess={refetch} />
    </div>
  );
};
