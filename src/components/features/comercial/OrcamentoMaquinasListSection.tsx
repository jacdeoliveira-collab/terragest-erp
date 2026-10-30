import React from 'react';
import { Plus, Trash2, Truck, Wrench } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';
import type { OrcamentoMaquinaItem } from '../../../types/comercial.types';
import { OrcamentoMaquinaCard } from './OrcamentoMaquinaCard';

interface Props {
  itens: OrcamentoMaquinaItem[];
  equipments: Equipment[];
  operadores: string[];
  onAddMaquina: () => void;
  onRemoveMaquina: (id: string) => void;
  onUpdateMaquina: (id: string, updates: Partial<OrcamentoMaquinaItem>) => void;
  onSelectEquipmentFrota: (itemId: string, eqId: string) => void;
  onAbrirNovaMaquina: () => void;
}

const IMPLEMENTOS_OPCOES = [
  'Concha Padrão (Escavação/Carga)',
  'Concha Reforçada p/ Rocha (HD)',
  'Rompedor Hidráulico (Martelete)',
  'Lâmina Frontal + Escarificador (Ripper)',
  'Concha + Lâmina (Retroescavadeira)',
  'Rolo Compactador Pé de Carneiro / Liso',
  'Caçamba Basculante (Transporte)',
  'Caminhão Pipa (Canhão / Barra Irrigadora)',
  'Garfo Pallet / Braço Munck',
  'Trado / Perfuratriz de Solo'
];

const FRANQUIAS_OPCOES = [
  'Por Medição de Horímetro (Sem Franquia)',
  'Franquia Mínima 8h / Dia',
  'Franquia Mínima 10h / Dia',
  'Franquia Mínima 40h / Semana',
  'Franquia Mínima 100h / Mês',
  'Franquia Mínima 180h / Mês',
  'Franquia Mínima 200h / Mês'
];

export const OrcamentoMaquinasListSection: React.FC<Props> = ({
  itens, equipments, operadores,
  onAddMaquina, onRemoveMaquina, onUpdateMaquina, onSelectEquipmentFrota, onAbrirNovaMaquina
}) => {
  return (
    <div className="space-y-3 p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl text-xs text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
        <div className="flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-gray-900">2. Maquinário e Equipamentos da Proposta ({itens.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onAbrirNovaMaquina} className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-semibold cursor-pointer text-[11px]">
            + Cadastrar na Frota
          </button>
          <button type="button" onClick={onAddMaquina} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer text-[11px] shadow-2xs">
            <Plus className="w-3.5 h-3.5" /> Adicionar Máquina
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {itens.map((item, idx) => {
          const eqFrota = equipments.find((e) => e.id === item.maquina_id);
          return (
            <div key={item.id} className="p-3 bg-white border border-amber-200 rounded-xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white inline-flex items-center justify-center text-[10px]">{idx + 1}</span>
                  {item.maquina_nome || `Equipamento #${idx + 1}`}
                  {item.maquina_codigo ? <span className="text-[10px] font-mono bg-amber-100 px-1.5 py-0.5 rounded">{item.maquina_codigo}</span> : null}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Subtotal: R$ {Number(item.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {itens.length > 1 && (
                    <button type="button" onClick={() => onRemoveMaquina(item.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer" title="Remover máquina">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selecionar Máquina da Frota *</label>
                  <select value={item.maquina_id || ''} onChange={(e) => onSelectEquipmentFrota(item.id, e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-medium">
                    <option value="">Selecione ou digite ao lado...</option>
                    {equipments.map((eq) => (<option key={eq.id} value={eq.id}>{eq.code} - {eq.name} ({eq.model || 'Linha Amarela'})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nome / Tipo da Máquina *</label>
                  <input type="text" placeholder="Ex: Escavadeira Hidráulica 22t" value={item.maquina_nome} onChange={(e) => onUpdateMaquina(item.id, { maquina_nome: e.target.value })} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marca / Modelo</label>
                  <input type="text" placeholder="Ex: New Holland E215C EVO / CAT 320" value={item.maquina_modelo || ''} onChange={(e) => onUpdateMaquina(item.id, { maquina_modelo: e.target.value })} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg" />
                </div>
              </div>

              {eqFrota && <OrcamentoMaquinaCard equipment={eqFrota} />}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Wrench className="w-3 h-3 text-amber-600" /> Implemento / Configuração</label>
                  <select value={item.implemento || IMPLEMENTOS_OPCOES[0]} onChange={(e) => onUpdateMaquina(item.id, { implemento: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg">
                    {IMPLEMENTOS_OPCOES.map((imp) => (<option key={imp} value={imp}>{imp}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Potência (HP) / Ano</label>
                  <div className="flex gap-1">
                    <input type="text" placeholder="HP" value={item.maquina_potencia || ''} onChange={(e) => onUpdateMaquina(item.id, { maquina_potencia: e.target.value })} className="w-1/2 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" />
                    <input type="text" placeholder="Ano" value={item.maquina_ano || ''} onChange={(e) => onUpdateMaquina(item.id, { maquina_ano: e.target.value })} className="w-1/2 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Horímetro Saída (h)</label>
                  <input type="number" step="0.1" value={item.maquina_horimetro_saida ?? 0} onChange={(e) => onUpdateMaquina(item.id, { maquina_horimetro_saida: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Operador Designado</label>
                  <select value={item.operador_nome || ''} onChange={(e) => onUpdateMaquina(item.id, { operador_nome: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg">
                    <option value="">A definir pela Locadora</option>
                    {operadores.map((op) => (<option key={op} value={op}>{op}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Franquia Mínima</label>
                  <select value={item.franquia_minima || FRANQUIAS_OPCOES[0]} onChange={(e) => onUpdateMaquina(item.id, { franquia_minima: e.target.value })} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg">
                    {FRANQUIAS_OPCOES.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Horas Estimadas (h) *</label>
                  <input type="number" step="1" min="1" required value={item.horas_estimadas} onChange={(e) => { const h = Number(e.target.value); onUpdateMaquina(item.id, { horas_estimadas: h, subtotal: Number((h * item.valor_hora).toFixed(2)) }); }} className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-lg font-mono font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Valor / Hora (R$) *</label>
                  <input type="number" step="0.01" min="0" required value={item.valor_hora} onChange={(e) => { const vh = Number(e.target.value); onUpdateMaquina(item.id, { valor_hora: vh, subtotal: Number((item.horas_estimadas * vh).toFixed(2)) }); }} className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-lg font-mono font-bold text-emerald-800" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
