import React, { useState, useMemo } from 'react';
import { Fuel, Plus, AlertCircle, Receipt } from 'lucide-react';
import { useAbastecimentos } from '../../../hooks/useAbastecimentos';
import { AbastecimentoTable } from './AbastecimentoTable';
import { AbastecimentoKpiCards } from './AbastecimentoKpiCards';
import { AbastecimentoModalsContainer } from './modal/AbastecimentoModalsContainer';
import { ListFilterBar, type OpcaoStatus } from '../../common/ListFilterBar';
import { exportarAbastecimentosPDF } from '../../../utils/exportOperacionalPdf';
import { exportarAbastecimentosExcel } from '../../../services/exportExcel';
import type { AbastecimentoItem } from '../../../types/abastecimento.types';

const OPCOES_COMBUSTIVEL: OpcaoStatus[] = [
  { valor: 'TODOS', label: 'Todos os Combustíveis' },
  { valor: 'DIESEL_S10', label: 'Diesel S-10', cor: 'emerald' },
  { valor: 'DIESEL_S500', label: 'Diesel S-500', cor: 'amber' },
  { valor: 'GASOLINA', label: 'Gasolina', cor: 'blue' },
  { valor: 'ARLA32', label: 'Arla 32', cor: 'indigo' }
];

export const AbastecimentoList: React.FC = () => {
  const { data, isLoading, error, refetch, atualizarAbastecimento, excluirAbastecimento } = useAbastecimentos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCupomModalOpen, setIsCupomModalOpen] = useState(false);
  const [abastecimentoDetalhes, setAbastecimentoDetalhes] = useState<AbastecimentoItem | null>(null);
  const [abastecimentoParaEditar, setAbastecimentoParaEditar] = useState<AbastecimentoItem | null>(null);

  const [busca, setBusca] = useState('');
  const [combustivelFiltro, setCombustivelFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const dadosFiltrados = useMemo(() => {
    return data.filter((item: AbastecimentoItem) => {
      if (combustivelFiltro !== 'TODOS' && item.tipo_combustivel !== combustivelFiltro) return false;
      if (dataInicio && item.data < dataInicio) return false;
      if (dataFim && item.data > dataFim) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const posto = (item.posto_fornecedor || '').toLowerCase();
        const maquina = `${item.maquina_codigo || ''} ${item.maquina_nome || ''}`.toLowerCase();
        const motorista = (item.operador_nome || '').toLowerCase();
        const cupom = (item.numero_requisicao_nf || '').toLowerCase();
        const vLitro = item.valor_unitario ? String(item.valor_unitario) : '';
        const vTotal = item.valor_total ? String(item.valor_total) : '';
        if (!posto.includes(termo) && !maquina.includes(termo) && !motorista.includes(termo) && !cupom.includes(termo) && !vLitro.includes(termo) && !vTotal.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [data, busca, combustivelFiltro, dataInicio, dataFim]);

  const handleCreated = () => {
    setIsModalOpen(false);
    setIsCupomModalOpen(false);
    setAbastecimentoParaEditar(null);
    refetch();
  };

  const handleExcluir = async (item: AbastecimentoItem) => {
    const nome = item.maquina_codigo || item.maquina_nome || 'este registro';
    if (window.confirm(`Deseja realmente excluir o abastecimento da máquina ${nome} do dia ${item.data} (${item.quantidade_litros}L)?`)) {
      await excluirAbastecimento(item.id);
      if (abastecimentoDetalhes?.id === item.id) setAbastecimentoDetalhes(null);
    }
  };

  if (isLoading) return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">Carregando registros de abastecimento...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Controle de Abastecimentos & Diesel</h2>
          <p className="text-xs text-gray-500">Gestão de postos parceiros, preços por litro, cupons fiscais e consumo de frota</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button onClick={() => setIsCupomModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
            <Receipt className="w-4 h-4" /> Lançar Cupom Fiscal
          </button>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Simples
          </button>
        </div>
      </div>

      <ListFilterBar
        busca={busca}
        setBusca={setBusca}
        placeholderBusca="Buscar por posto, máquina, motorista, cupom, valor..."
        statusFiltro={combustivelFiltro}
        setStatusFiltro={setCombustivelFiltro}
        opcoesStatus={OPCOES_COMBUSTIVEL}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        onExportarPdf={() => exportarAbastecimentosPDF(dadosFiltrados)}
        labelExportar="Exportar PDF"
        onExportarExcel={() => exportarAbastecimentosExcel(dadosFiltrados)}
        labelExportarExcel="Exportar Excel"
        totalFiltrados={dadosFiltrados.length}
        totalGeral={data.length}
      />

      {error && <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2"><AlertCircle className="w-5 h-5 shrink-0 text-rose-500" /><span>{error}</span></div>}

      {dadosFiltrados.length > 0 && <AbastecimentoKpiCards data={dadosFiltrados} />}

      {dadosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Fuel className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum abastecimento encontrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">Ajuste os filtros de pesquisa ou lance um cupom fiscal / abastecimento.</p>
        </div>
      ) : (
        <AbastecimentoTable
          data={dadosFiltrados}
          onVerDetalhes={(item) => setAbastecimentoDetalhes(item)}
          onEditar={(item) => setAbastecimentoParaEditar(item)}
          onExcluir={handleExcluir}
        />
      )}

      <AbastecimentoModalsContainer
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        isCupomModalOpen={isCupomModalOpen} setIsCupomModalOpen={setIsCupomModalOpen}
        abastecimentoDetalhes={abastecimentoDetalhes} setAbastecimentoDetalhes={setAbastecimentoDetalhes}
        abastecimentoParaEditar={abastecimentoParaEditar} setAbastecimentoParaEditar={setAbastecimentoParaEditar}
        onSuccess={handleCreated} onAtualizar={atualizarAbastecimento} onExcluir={handleExcluir}
      />
    </div>
  );
};
