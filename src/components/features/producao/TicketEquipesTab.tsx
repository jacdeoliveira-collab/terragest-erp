import React from 'react';
import { Truck, Tractor, User, HardHat } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';
import type { Funcionario } from '../../../types/rh.types';

interface TicketEquipesTabProps {
  caminhaoId: string;
  setCaminhaoId: (val: string) => void;
  escavadeiraId: string;
  setEscavadeiraId: (val: string) => void;
  operadorCaminhaoId: string;
  setOperadorCaminhaoId: (val: string) => void;
  apontadorId: string;
  setApontadorId: (val: string) => void;
  equipments: Equipment[];
  funcionarios: Funcionario[];
  loadingEquips: boolean;
  loadingFuncs: boolean;
}

export const TicketEquipesTab: React.FC<TicketEquipesTabProps> = ({
  caminhaoId,
  setCaminhaoId,
  escavadeiraId,
  setEscavadeiraId,
  operadorCaminhaoId,
  setOperadorCaminhaoId,
  apontadorId,
  setApontadorId,
  equipments,
  funcionarios,
  loadingEquips,
  loadingFuncs
}) => {
  const caminhoes = equipments.filter(
    (e) => e.type.includes('CAMINHAO') || e.category === 'CAMINHAO' || e.name.toLowerCase().includes('caminhão') || e.name.toLowerCase().includes('caçamba')
  );
  const listaCaminhoes = caminhoes.length > 0 ? caminhoes : equipments;

  const escavadeiras = equipments.filter(
    (e) => e.type.includes('ESCAVADEIRA') || e.type.includes('PA_CARREGADEIRA') || e.name.toLowerCase().includes('escavadeira') || e.name.toLowerCase().includes('pá')
  );
  const listaCarga = escavadeiras.length > 0 ? escavadeiras : equipments;

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Caminhão de Transporte (Caçamba / Basculante) *</span>
        </label>
        <select
          required
          value={caminhaoId}
          onChange={(e) => setCaminhaoId(e.target.value)}
          disabled={loadingEquips || equipments.length === 0}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Selecione o caminhão da viagem</option>
          {listaCaminhoes.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.code} - {eq.name} {eq.placa ? `(Placa: ${eq.placa})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
          <Tractor className="w-4 h-4 text-amber-600" />
          <span>Equipamento de Carga (Escavadeira / Pá) *</span>
        </label>
        <select
          required
          value={escavadeiraId}
          onChange={(e) => setEscavadeiraId(e.target.value)}
          disabled={loadingEquips || equipments.length === 0}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Selecione a máquina carregadeira</option>
          {listaCarga.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.code} - {eq.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Motorista / Operador do Caminhão</span>
          </label>
          <select
            value={operadorCaminhaoId}
            onChange={(e) => setOperadorCaminhaoId(e.target.value)}
            disabled={loadingFuncs}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione o motorista</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <HardHat className="w-3.5 h-3.5 text-purple-600" />
            <span>Sinaleiro / Apontador Responsável</span>
          </label>
          <select
            value={apontadorId}
            onChange={(e) => setApontadorId(e.target.value)}
            disabled={loadingFuncs}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione o apontador</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
