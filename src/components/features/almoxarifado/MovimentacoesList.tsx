import React, { useState, useMemo } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Package, AlertCircle } from 'lucide-react';
import { useMovimentacoes } from '../../../hooks/useMovimentacoes';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { MovimentacaoForm } from './MovimentacaoForm';
import { MovimentacaoTableRow } from './MovimentacaoTableRow';
import { ListFilterBar, type OpcaoStatus } from '../../common/ListFilterBar';
import { exportarAlmoxarifadoMovimentacoesPDF } from '../../../utils/exportAlmoxarifadoPdf';
import type { MovimentacaoAlmoxarifadoItem } from '../../../types/almoxarifado.types';

const OPCOES_TIPO_MOV: OpcaoStatus[] = [
  { valor: 'TODOS', label: 'Todas Movimentações' },
  { valor: 'ENTRADA', label: 'Entradas', cor: 'emerald' },
  { valor: 'SAIDA', label: 'Saídas', cor: 'rose' }
];

export const MovimentacoesList: React.FC = () => {
  const { obraSelecionada } = useObraContext();
  const { data, isLoading, error, refetch } = useMovimentacoes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const dadosFiltrados = useMemo(() => {
    return data.filter((item: MovimentacaoAlmoxarifadoItem) => {
      if (tipoFiltro !== 'TODOS' && item.tipo_movimentacao !== tipoFiltro) return false;
      if (dataInicio && item.data < dataInicio) return false;
      if (dataFim && item.data > dataFim) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const mat = (item.material_nome || '').toLowerCase();
        const forn = (item.fornecedor_nome || '').toLowerCase();
        const nf = (item.numero_nf || '').toLowerCase();
        const ticket = (item.ticket_balanca_numero || '').toLowerCase();
        const obs = (item.observacoes || '').toLowerCase();
        if (!mat.includes(termo) && !forn.includes(termo) && !nf.includes(termo) && !ticket.includes(termo) && !obs.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [data, busca, tipoFiltro, dataInicio, dataFim]);

  const totalEntradas = dadosFiltrados.filter((d) => d.tipo_movimentacao === 'ENTRADA').length;
  const totalSaidas = dadosFiltrados.filter((d) => d.tipo_movimentacao === 'SAIDA').length;

  if (isLoading) return <div className="p-12 text-center text-xs text-gray-400">Carregando movimentações...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Almoxarifado & Recebimento de Materiais</h2>
          <p className="text-xs text-gray-500">Controle de insumos pesados, tickets de balança e notas fiscais de entrada/saída</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Registrar Movimentação
        </button>
      </div>

      <ListFilterBar
        busca={busca}
        setBusca={setBusca}
        placeholderBusca="Buscar por material, fornecedor, NF, balança..."
        statusFiltro={tipoFiltro}
        setStatusFiltro={setTipoFiltro}
        opcoesStatus={OPCOES_TIPO_MOV}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        onExportarPdf={() => exportarAlmoxarifadoMovimentacoesPDF(dadosFiltrados, obraSelecionada?.nome)}
        labelExportar="Exportar Almoxarifado (PDF)"
        totalFiltrados={dadosFiltrados.length}
        totalGeral={data.length}
      />

      {error && <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{error}</span></div>}

      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Filtrados</span>
          <div className="text-lg font-bold font-mono text-gray-900">{dadosFiltrados.length}</div>
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

      {dadosFiltrados.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Nenhuma movimentação encontrada</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Ajuste os filtros ou use o botão para registrar uma movimentação.</p>
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
              {dadosFiltrados.map((item) => (
                <MovimentacaoTableRow key={item.id} item={item} />
              ))}
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
