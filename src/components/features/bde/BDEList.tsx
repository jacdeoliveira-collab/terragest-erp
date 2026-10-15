import React, { useState, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useBDE } from '../../../hooks/useBDE';
import { useEquipments } from '../../../hooks/useEquipments';
import { useEmpresaConfig } from '../../../hooks/useEmpresaConfig';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { BDEForm } from './BDEForm';
import { BDETableRow } from './BDETableRow';
import { ListFilterBar, type OpcaoStatus } from '../../common/ListFilterBar';
import { gerarRelatorioBDE } from '../../../utils/exportBDE';
import type { DailyBulletin } from '../../../types/bde.types';

const OPCOES_STATUS_BDE: OpcaoStatus[] = [
  { valor: 'TODOS', label: 'Todos os Status' },
  { valor: 'PENDENTE', label: 'Pendente', cor: 'amber' },
  { valor: 'APROVADO', label: 'Aprovado', cor: 'emerald' },
  { valor: 'REJEITADO', label: 'Rejeitado', cor: 'rose' }
];

export const BDEList: React.FC = () => {
  const { data, isLoading, error, refetch } = useBDE();
  const { data: equipments } = useEquipments();
  const { empresa } = useEmpresaConfig();
  const { obraSelecionada } = useObraContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const equipMap = useMemo(() => {
    const map = new Map<string, string>();
    equipments.forEach((eq) => map.set(eq.id, eq.code ? `${eq.code} - ${eq.name}` : eq.name));
    return map;
  }, [equipments]);

  const dadosFiltrados = useMemo(() => {
    return data.filter((b: DailyBulletin) => {
      if (statusFiltro !== 'TODOS' && (b.status_aprovacao || 'PENDENTE') !== statusFiltro) return false;
      if (dataInicio && b.date < dataInicio) return false;
      if (dataFim && b.date > dataFim) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const eqNome = (equipMap.get(b.equipment_id) || b.equipment_code || b.equipment_name || '').toLowerCase();
        const opNome = (b.operador_nome || b.operator_name || '').toLowerCase();
        const desc = (b.service_description || '').toLowerCase();
        const estacas = `${b.estaca_inicial || ''} ${b.estaca_final || ''}`.toLowerCase();
        if (!eqNome.includes(termo) && !opNome.includes(termo) && !desc.includes(termo) && !estacas.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [data, busca, statusFiltro, dataInicio, dataFim, equipMap]);

  if (isLoading) return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">Carregando boletins...</div>;
  if (error) return <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Boletins Diários de Equipamento (BDE)</h2>
          <p className="text-[11px] text-gray-500">Controle de horímetro, produção, estaqueamento e aprovação operacional</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" /> Novo BDE
        </button>
      </div>

      <ListFilterBar
        busca={busca}
        setBusca={setBusca}
        placeholderBusca="Buscar por máquina, operador, atividade, estaca..."
        statusFiltro={statusFiltro}
        setStatusFiltro={setStatusFiltro}
        opcoesStatus={OPCOES_STATUS_BDE}
        dataInicio={dataInicio}
        setDataInicio={setDataInicio}
        dataFim={dataFim}
        setDataFim={setDataFim}
        onExportarPdf={() => gerarRelatorioBDE(dadosFiltrados, obraSelecionada?.nome)}
        labelExportar="Exportar BDEs (PDF)"
        totalFiltrados={dadosFiltrados.length}
        totalGeral={data.length}
      />

      {dadosFiltrados.length === 0 ? (
        <div className="p-10 text-center text-gray-400">Nenhum boletim encontrado com os filtros aplicados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Máquina / Operador</th>
                <th className="p-3">Estaqueamento</th>
                <th className="p-3 text-right">Produtivas</th>
                <th className="p-3 text-right">Ociosas</th>
                <th className="p-3">Atividades</th>
                <th className="p-3 text-center">Aprovação</th>
                <th className="p-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {dadosFiltrados.map((item: DailyBulletin) => (
                <BDETableRow
                  key={item.id}
                  item={item}
                  equipNome={equipMap.get(item.equipment_id)}
                  empresa={empresa}
                  obraNome={obraSelecionada?.nome}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lançar Boletim Diário de Equipamento (BDE)">
        <BDEForm onSuccess={() => { setIsModalOpen(false); refetch(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
