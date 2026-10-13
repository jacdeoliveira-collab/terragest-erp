import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Scale, Package, FileText, AlertCircle } from 'lucide-react';
import { useMovimentacoes } from '../../../hooks/useMovimentacoes';
import { Modal } from '../../ui/Modal';
import { MovimentacaoForm } from './MovimentacaoForm';
import type { MovimentacaoAlmoxarifadoItem } from '../../../types/almoxarifado.types';

export const MovimentacoesList: React.FC = () => {
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS');
  const { data, isLoading, error, refetch } = useMovimentacoes({ tipoFiltro });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalEntradas = data.filter((d) => d.tipo_movimentacao === 'ENTRADA').length;
  const totalSaidas = data.filter((d) => d.tipo_movimentacao === 'SAIDA').length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Almoxarifado & Recebimento de Materiais</h2>
          <p className="text-xs text-gray-500">Controle de insumos pesados, tickets de balança e notas fiscais de entrada/saída</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-0.5 rounded-xl text-xs font-semibold">
            {(['TODOS', 'ENTRADA', 'SAIDA'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoFiltro(tipo)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${tipoFiltro === tipo ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tipo === 'TODOS' ? 'Todos' : tipo === 'ENTRADA' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Registrar Movimentação</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Registros</span>
          <div className="text-lg font-bold font-mono text-gray-900">{data.length}</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> Entradas</span>
          <div className="text-lg font-bold font-mono text-emerald-700">{totalEntradas}</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Saídas</span>
          <div className="text-lg font-bold font-mono text-rose-700">{totalSaidas}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Carregando movimentações...</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Nenhuma movimentação registrada</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Clique em "Registrar Movimentação" para lançar ticket de balança ou NF.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3 text-center">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3">Material & Qtde</th>
                <th className="p-3">Fornecedor / Obra</th>
                <th className="p-3">Doc Fiscal</th>
                <th className="p-3">Ticket Balança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: MovimentacaoAlmoxarifadoItem) => {
                const isEntrada = item.tipo_movimentacao === 'ENTRADA';
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isEntrada ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isEntrada ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                        {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-600">{new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">{item.material_nome}</div>
                      <div className="text-[11px] font-mono text-emerald-700 font-semibold">{item.quantidade.toLocaleString('pt-BR')} {item.unidade_medida}</div>
                    </td>
                    <td className="p-3 font-medium text-gray-800">
                      <div>{item.fornecedor_nome || '—'}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{item.obra_nome}</div>
                    </td>
                    <td className="p-3">
                      {item.numero_nf ? (
                        <div className="flex items-center gap-1 font-mono text-gray-700"><FileText className="w-3 h-3 text-gray-400" /><span>NF: {item.numero_nf}</span></div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-3">
                      {item.ticket_balanca_numero ? (
                        <div className="font-mono">
                          <div className="flex items-center gap-1 text-gray-900 font-bold"><Scale className="w-3 h-3 text-amber-600" /><span>#{item.ticket_balanca_numero}</span></div>
                          {item.peso_liquido_kg && <div className="text-[10px] text-gray-500">Líq: {item.peso_liquido_kg.toLocaleString('pt-BR')} kg</div>}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Movimentação de Almoxarifado">
        <MovimentacaoForm onSuccess={() => { setIsModalOpen(false); refetch(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
