import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ServicoMaquinaItem } from '../../../../types/servicoHorimetro.types';
import { useEquipments } from '../../../../hooks/useEquipments';
import { OrcamentoMaquinaCard } from '../OrcamentoMaquinaCard';
import { FotoHorimetroUploadField } from './FotoHorimetroUploadField';

interface Props {
  item: ServicoMaquinaItem;
  indice: number;
  podeRemover: boolean;
  maquinasDisponiveis: string[];
  operadoresDisponiveis: string[];
  onAtualizar: (updates: Partial<ServicoMaquinaItem>) => void;
  onRemover: () => void;
  onAbrirNovaMaquina?: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, key: string, setter: (url: string) => void) => void;
}

function parseNumero(val: string): number {
  if (!val) return 0;
  const n = parseFloat(val.toString().replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export const MaquinaHorimetroCard: React.FC<Props> = ({
  item, indice, podeRemover,
  maquinasDisponiveis, operadoresDisponiveis,
  onAtualizar, onRemover, onAbrirNovaMaquina,
  handleImageUpload
}) => {
  const { data: equipments } = useEquipments();
  const eqFrota = (equipments || []).find(
    (eq) =>
      `${eq.name} (${eq.code})`.toLowerCase() === (item.maquina_nome || '').trim().toLowerCase() ||
      (eq.code && (item.maquina_nome || '').includes(eq.code))
  );

  const handleSelectMaquina = (val: string) => {
    const found = (equipments || []).find((eq) => `${eq.name} (${eq.code})` === val);
    const upd: Partial<ServicoMaquinaItem> = { maquina_nome: val, maquina_id: found?.id };
    if (found?.current_hourmeter && (!item.horimetro_inicial || item.horimetro_inicial === 0)) {
      upd.horimetro_inicial = Number(found.current_hourmeter);
    }
    onAtualizar(upd);
  };

  return (
    <div className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">{indice + 1}</div>
          <span className="font-bold text-gray-900 text-xs">{item.maquina_nome || `Equipamento #${indice + 1}`}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
            {item.horas_trabalhadas.toFixed(1)} h • R$ {item.faturamento_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {podeRemover && (
            <button type="button" onClick={onRemover} title="Remover Máquina" className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-gray-700 text-[11px]">Máquina / Equipamento *</label>
            {onAbrirNovaMaquina && (
              <button type="button" onClick={onAbrirNovaMaquina} className="text-[10px] text-emerald-700 hover:underline">
                + Nova
              </button>
            )}
          </div>
          <select
            value={item.maquina_nome}
            onChange={(e) => handleSelectMaquina(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="">Selecione o equipamento</option>
            {maquinasDisponiveis.map((maq, i) => (
              <option key={i} value={maq}>{maq}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 text-[11px] mb-1">Operador Desta Máquina</label>
          <select
            value={item.operador_nome}
            onChange={(e) => onAtualizar({ operador_nome: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
          >
            <option value="">Selecione o operador</option>
            {operadoresDisponiveis.map((op, i) => (
              <option key={i} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 text-[11px] mb-1">Valor da Hora Desta Máquina (R$/h) *</label>
          <input
            type="number" step="0.50" min="0" placeholder="Ex: 320.00"
            value={item.valor_hora || ''}
            onChange={(e) => onAtualizar({ valor_hora: parseNumero(e.target.value) })}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-emerald-700"
          />
        </div>
      </div>

      {eqFrota && <OrcamentoMaquinaCard equipment={eqFrota} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
            <span>Horímetro Inicial</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Início</span>
          </div>
          <input
            type="number" step="0.1" min="0" placeholder="Ex: 1250.0"
            value={item.horimetro_inicial || ''}
            onChange={(e) => onAtualizar({ horimetro_inicial: parseNumero(e.target.value) })}
            className="w-full px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs font-mono font-bold"
          />
          <FotoHorimetroUploadField
            label="Foto Horímetro Inicial" badge="Inicial" badgeClass="bg-emerald-100 text-emerald-800"
            valorFoto={item.foto_horimetro_inicial} inputId={`upload_ini_${item.id}`}
            onUpload={(e) => handleImageUpload(e, `ini_${item.id}`, (url) => onAtualizar({ foto_horimetro_inicial: url }))}
            onRemover={() => onAtualizar({ foto_horimetro_inicial: undefined })}
          />
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
            <span>Horímetro Final</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Fechamento</span>
          </div>
          <input
            type="number" step="0.1" min="0" placeholder="Deixe vazio se em andamento"
            value={item.horimetro_final !== undefined ? item.horimetro_final : ''}
            onChange={(e) => onAtualizar({ horimetro_final: e.target.value ? parseNumero(e.target.value) : undefined })}
            className="w-full px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs font-mono font-bold"
          />
          <FotoHorimetroUploadField
            label="Foto Horímetro Final" badge="Final" badgeClass="bg-amber-100 text-amber-800"
            valorFoto={item.foto_horimetro_final} inputId={`upload_fim_${item.id}`}
            onUpload={(e) => handleImageUpload(e, `fim_${item.id}`, (url) => onAtualizar({ foto_horimetro_final: url }))}
            onRemover={() => onAtualizar({ foto_horimetro_final: undefined })}
          />
        </div>
      </div>
    </div>
  );
};
