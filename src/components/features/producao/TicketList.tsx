import React, { useState, useMemo } from 'react';
import { Navigation, Plus, AlertCircle } from 'lucide-react';
import { useTickets } from '../../../hooks/useTickets';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { TicketViagemForm } from './TicketViagemForm';
import { TicketTableRow } from './TicketTableRow';
import { ListFilterBar, type OpcaoStatus } from '../../common/ListFilterBar';
import { exportarProducaoViagensPDF } from '../../../utils/exportProducaoPdf';
import { exportarProducaoViagensExcel } from '../../../services/exportExcel';
import type { ApontamentoViagemItem } from '../../../types/producao.types';

const OPCOES_MATERIAL: OpcaoStatus[] = [
  { valor: 'TODOS', label: 'Todos os Materiais' },
  { valor: 'SOLO_COMUM', label: 'Solo Comum', cor: 'amber' },
  { valor: 'ROCHA', label: 'Rocha', cor: 'slate' },
  { valor: 'BOTA_FORA', label: 'Bota-Fora', cor: 'rose' },
  { valor: 'ATERRO', label: 'Aterro', cor: 'emerald' },
  { valor: 'SAIBRO', label: 'Saibro', cor: 'amber' },
  { valor: 'AREIA', label: 'Areia', cor: 'blue' },
  { valor: 'BRITA', label: 'Brita', cor: 'indigo' }
];

export const TicketList: React.FC = () => {
  const { obraSelecionada } = useObraContext();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { data, isLoading, error, refetch } = useTickets({ dataInicio, dataFim });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [busca, setBusca] = useState('');
  const [materialFiltro, setMaterialFiltro] = useState('TODOS');

  const dadosFiltrados = useMemo(() => {
    return data.filter((t: ApontamentoViagemItem) => {
      if (materialFiltro !== 'TODOS' && t.material_tipo !== materialFiltro) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const ticketNum = (t.numero_ticket || '').toLowerCase();
        const caminhao = `${t.caminhao_codigo || ''} ${t.caminhao_nome || ''} ${t.caminhao_placa || ''}`.toLowerCase();
        const escavadeira = `${t.escavadeira_codigo || ''} ${t.escavadeira_nome || ''}`.toLowerCase();
        const motorista = (t.operador_caminhao_nome || '').toLowerCase();
        const estacas = `${t.origem_estaca || ''} ${t.destino_estaca || ''}`.toLowerCase();
        if (!ticketNum.includes(termo) && !caminhao.includes(termo) && !escavadeira.includes(termo) && !motorista.includes(termo) && !estacas.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [data, busca, materialFiltro]);

  const volumeTotal = dadosFiltrados.reduce((acc, t) => acc + (Number(t.volume_m3) || 0), 0);

  if (isLoading) return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">Carregando viagens de produção...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Produção de Terraplanagem (Tickets do Sinaleiro)</h2>
          <p className="text-xs text-gray-500">Controle de ciclos de transporte, DMT, cubagem e bota-fora da obra</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Emitir Viagem
        </button>
      </div>

      <ListFilterBar
        busca={busca}
        setBusca={setBusca}
        placeholderBusca="Buscar por ticket, caminhão, escavadeira, motorista..."
        statusFiltro={materialFiltro}
        setStatusFiltro={setMaterialFiltro}
        opcoesStatus={OPCOES_MATERIAL}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        onExportarPdf={() => exportarProducaoViagensPDF(dadosFiltrados, obraSelecionada?.nome)}
        labelExportar="Exportar PDF"
        onExportarExcel={() => exportarProducaoViagensExcel(dadosFiltrados, obraSelecionada?.nome)}
        labelExportarExcel="Exportar Excel"
        totalFiltrados={dadosFiltrados.length}
        totalGeral={data.length}
      />

      {error && <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{error}</span></div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Viagens Filtradas</span>
          <div className="text-lg font-bold font-mono text-gray-900">{dadosFiltrados.length} ciclos</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Volume Filtrado</span>
          <div className="text-lg font-bold font-mono text-emerald-700">{volumeTotal.toFixed(1)} m³</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Média / Viagem</span>
          <div className="text-lg font-bold font-mono text-blue-700">{dadosFiltrados.length > 0 ? (volumeTotal / dadosFiltrados.length).toFixed(1) : '0'} m³/viagem</div>
        </div>
      </div>

      {dadosFiltrados.length === 0 ? (
        <div className="p-12 text-center">
          <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Nenhum ticket encontrado</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Ajuste os filtros ou use o botão acima para registrar um ciclo.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Ticket / Horário</th>
                <th className="p-3">Caminhão & Placa</th>
                <th className="p-3">Equip. Carga</th>
                <th className="p-3 text-center">Material</th>
                <th className="p-3 text-right">Volume (m³)</th>
                <th className="p-3">Trajeto (Estacas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {dadosFiltrados.map((item) => (
                <TicketTableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Emitir Ticket de Viagem (Sinaleiro)">
        <TicketViagemForm onSuccess={() => { setIsModalOpen(false); refetch(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
