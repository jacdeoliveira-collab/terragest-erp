import React from 'react';
import { Plus, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import type { ServicoMaquinaItem, FotoTrabalhoItem } from '../../../../types/servicoHorimetro.types';
import { MaquinaHorimetroCard } from './MaquinaHorimetroCard';
import { FotosTrabalhoSection } from './FotosTrabalhoSection';

interface AbaHorimetrosProps {
  maquinasItens: ServicoMaquinaItem[];
  onAdicionarMaquina: () => void;
  onRemoverMaquina: (id: string) => void;
  onAtualizarMaquina: (id: string, updates: Partial<ServicoMaquinaItem>) => void;
  maquinasDisponiveis: string[];
  operadoresDisponiveis: string[];
  onAbrirNovaMaquina?: () => void;
  alertaPainel: string;
  setAlertaPainel: (v: string) => void;
  horasTrabalhadas: number;
  faturamentoBruto: number;
  mensagemOcr?: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, key: string, setter: (url: string) => void) => void;
  fotosTrabalho?: FotoTrabalhoItem[];
  setFotosTrabalho?: (fotos: FotoTrabalhoItem[]) => void;
}

export const AbaHorimetros: React.FC<AbaHorimetrosProps> = ({
  maquinasItens, onAdicionarMaquina, onRemoverMaquina, onAtualizarMaquina,
  maquinasDisponiveis, operadoresDisponiveis, onAbrirNovaMaquina,
  alertaPainel, setAlertaPainel,
  horasTrabalhadas, faturamentoBruto,
  mensagemOcr, handleImageUpload,
  fotosTrabalho, setFotosTrabalho
}) => {
  return (
    <div className="space-y-4 text-xs text-left">
      {mensagemOcr && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{mensagemOcr}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-900 text-xs">Máquinas & Equipamentos Alocados na Obra</h4>
          <p className="text-[11px] text-gray-500">Você pode alocar mais de uma máquina para o mesmo cliente com taxas horárias distintas</p>
        </div>
        <button
          type="button" onClick={onAdicionarMaquina}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Outra Máquina</span>
        </button>
      </div>

      <div className="space-y-3">
        {maquinasItens.map((item, idx) => (
          <MaquinaHorimetroCard
            key={item.id}
            item={item}
            indice={idx}
            podeRemover={maquinasItens.length > 1}
            maquinasDisponiveis={maquinasDisponiveis}
            operadoresDisponiveis={operadoresDisponiveis}
            onAtualizar={(upd) => onAtualizarMaquina(item.id, upd)}
            onRemover={() => onRemoverMaquina(item.id)}
            onAbrirNovaMaquina={onAbrirNovaMaquina}
            handleImageUpload={handleImageUpload}
          />
        ))}
      </div>

      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
            Total Consolidado de Horas ({maquinasItens.length} máquina{maquinasItens.length > 1 ? 's' : ''})
          </span>
          <span className="text-xl font-black text-emerald-900 font-mono">
            {horasTrabalhadas.toFixed(1)} horas
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Faturamento Bruto Total</span>
          <span className="text-lg font-black text-emerald-800 font-mono">
            R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Alertas no Painel / Observações Operacionais
        </label>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text" placeholder="Ex: VERIFICAR FILTRO DIESEL / PRESSÃO ÓLEO"
            value={alertaPainel} onChange={(e) => setAlertaPainel(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs"
          />
        </div>
      </div>

      {fotosTrabalho && setFotosTrabalho && (
        <div className="pt-2 border-t border-gray-200">
          <FotosTrabalhoSection fotos={fotosTrabalho} onChangeFotos={setFotosTrabalho} />
        </div>
      )}
    </div>
  );
};
