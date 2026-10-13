import React, { useState } from 'react';
import { Navigation, Plus, AlertCircle, Calendar } from 'lucide-react';
import { useTickets } from '../../../hooks/useTickets';
import { Modal } from '../../ui/Modal';
import { TicketViagemForm } from './TicketViagemForm';
import type { ApontamentoViagemItem, TipoMaterialProducao } from '../../../types/producao.types';

function renderMaterialBadge(tipo: TipoMaterialProducao) {
  const styles: Record<TipoMaterialProducao, string> = {
    SOLO_COMUM: 'bg-amber-50 text-amber-800 border-amber-200',
    ROCHA: 'bg-slate-100 text-slate-800 border-slate-300',
    BOTA_FORA: 'bg-rose-50 text-rose-800 border-rose-200',
    ATERRO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    SAIBRO: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    AREIA: 'bg-blue-50 text-blue-800 border-blue-200',
    BRITA: 'bg-purple-50 text-purple-800 border-purple-200'
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[tipo] || 'bg-gray-100 text-gray-800'}`}>{tipo.replace('_', ' ')}</span>;
}

export const TicketList: React.FC = () => {
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().slice(0, 10));
  const { data, isLoading, error, refetch } = useTickets({ dataFiltro });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  const volumeTotal = data.reduce((acc, t) => acc + (Number(t.volume_m3) || 0), 0);

  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">Carregando viagens de produção...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Produção de Terraplanagem (Tickets do Sinaleiro)</h2>
          <p className="text-xs text-gray-500">Controle de ciclos de transporte, DMT, cubagem e bota-fora da obra</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="bg-transparent font-medium text-gray-700 outline-none" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Emitir Viagem</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Viagens Registradas</span>
          <div className="text-lg font-bold font-mono text-gray-900">{data.length} ciclos</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Volume Transportado</span>
          <div className="text-lg font-bold font-mono text-emerald-700">{volumeTotal.toFixed(1)} m³</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Média por Viagem</span>
          <div className="text-lg font-bold font-mono text-blue-700">{data.length > 0 ? (volumeTotal / data.length).toFixed(1) : '0'} m³/viagem</div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-12 text-center">
          <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Nenhum ticket emitido nesta data</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Use o botão acima para registrar o primeiro ciclo de carga do sinaleiro.</p>
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
              {data.map((item: ApontamentoViagemItem) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-800">
                    <div>{item.numero_ticket}</div>
                    <div className="text-[10px] font-normal text-gray-400">{new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    <div>{item.caminhao_codigo}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{item.caminhao_placa ? `Placa: ${item.caminhao_placa}` : item.caminhao_nome}</div>
                  </td>
                  <td className="p-3 text-gray-700">{item.escavadeira_codigo}</td>
                  <td className="p-3 text-center">{renderMaterialBadge(item.material_tipo)}</td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900">{Number(item.volume_m3).toFixed(1)} m³</td>
                  <td className="p-3 text-[11px] text-gray-500">
                    <span>{item.origem_estaca || 'Corte'} &rarr; {item.destino_estaca || 'Aterro'}</span>
                    {item.dmt_km ? <span className="block text-[10px] text-gray-400 font-mono">DMT: {item.dmt_km} km</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Emitir Ticket de Viagem (Sinaleiro)">
        <TicketViagemForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
