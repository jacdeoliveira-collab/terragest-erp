import React, { useState } from 'react';
import { AlertCircle, Truck, Layers, Send } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateTicket } from '../../../hooks/useCreateTicket';
import { TicketEquipesTab } from './TicketEquipesTab';
import { TicketOperacaoTab } from './TicketOperacaoTab';
import type { TipoMaterialProducao } from '../../../types/producao.types';

interface TicketViagemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TicketViagemForm: React.FC<TicketViagemFormProps> = ({ onSuccess, onCancel }) => {
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios();
  const { createTicket, isSubmitting, error, limparErro } = useCreateTicket();

  const [activeTab, setActiveTab] = useState<'equipes' | 'operacao'>('equipes');
  const [caminhaoId, setCaminhaoId] = useState('');
  const [escavadeiraId, setEscavadeiraId] = useState('');
  const [operadorCaminhaoId, setOperadorCaminhaoId] = useState('');
  const [apontadorId, setApontadorId] = useState('');
  const [materialTipo, setMaterialTipo] = useState<TipoMaterialProducao>('SOLO_COMUM');
  const [volumeM3, setVolumeM3] = useState<number>(12);
  const [origemEstaca, setOrigemEstaca] = useState('');
  const [destinoEstaca, setDestinoEstaca] = useState('');
  const [dmtKm, setDmtKm] = useState<number>(1);
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createTicket({
      caminhao_id: caminhaoId,
      escavadeira_id: escavadeiraId,
      operador_caminhao_id: operadorCaminhaoId || undefined,
      apontador_id: apontadorId || undefined,
      material_tipo: materialTipo,
      volume_m3: volumeM3,
      origem_estaca: origemEstaca,
      destino_estaca: destinoEstaca,
      dmt_km: dmtKm,
      observacoes
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Navegação Mobile-First */}
      <div className="flex border-b border-gray-200 bg-gray-50/70 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('equipes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'equipes' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>1. Caminhão & Carga</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('operacao')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'operacao' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Material & DMT</span>
        </button>
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'equipes' ? (
          <TicketEquipesTab
            caminhaoId={caminhaoId} setCaminhaoId={setCaminhaoId}
            escavadeiraId={escavadeiraId} setEscavadeiraId={setEscavadeiraId}
            operadorCaminhaoId={operadorCaminhaoId} setOperadorCaminhaoId={setOperadorCaminhaoId}
            apontadorId={apontadorId} setApontadorId={setApontadorId}
            equipments={equipments} funcionarios={funcionarios}
            loadingEquips={loadingEquips} loadingFuncs={loadingFuncs}
          />
        ) : (
          <TicketOperacaoTab
            materialTipo={materialTipo} setMaterialTipo={setMaterialTipo}
            volumeM3={volumeM3} setVolumeM3={setVolumeM3}
            origemEstaca={origemEstaca} setOrigemEstaca={setOrigemEstaca}
            destinoEstaca={destinoEstaca} setDestinoEstaca={setDestinoEstaca}
            dmtKm={dmtKm} setDmtKm={setDmtKm}
            observacoes={observacoes} setObservacoes={setObservacoes}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !caminhaoId || !escavadeiraId}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Gravando Viagem...' : 'Emitir Ticket de Viagem'}</span>
        </button>
      </div>
    </form>
  );
};
