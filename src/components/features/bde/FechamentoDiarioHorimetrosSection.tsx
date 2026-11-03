import React from 'react';
import { Clock, Truck, Camera, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  horimetroInicial: number;
  horimetroFinal: number;
  horasProdutivas: number;
  horasDeslocamento: number;
  horasRodadas: number;
  fotoUrl: string;
  uploading: boolean;
  onFinalChange: (val: number) => void;
  onProdutivasChange: (val: number) => void;
  onDeslocamentoChange: (val: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FechamentoDiarioHorimetrosSection: React.FC<Props> = ({
  horimetroInicial, horimetroFinal, horasProdutivas, horasDeslocamento, horasRodadas,
  fotoUrl, uploading, onFinalChange, onProdutivasChange, onDeslocamentoChange, onUpload
}) => {
  return (
    <div className="space-y-2.5">
      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Horímetro Início</span>
            <span className="font-mono font-bold text-sm text-gray-800">{horimetroInicial.toFixed(2)}</span>
          </div>
          <div>
            <label className="text-[10px] text-emerald-800 font-bold uppercase block">Horímetro Tarde *</label>
            <input
              type="number" step="0.01" required value={horimetroFinal || ''}
              onChange={(e) => onFinalChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-sm text-emerald-900"
            />
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-emerald-300">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Rodado no Dia</span>
            <span className="font-mono font-black text-sm text-emerald-800">{horasRodadas.toFixed(2)}h</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-900 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" /> Horas Produção (h)
            </label>
            <input
              type="number" step="0.1" value={horasProdutivas || ''}
              onChange={(e) => onProdutivasChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-emerald-300 rounded-lg font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-blue-900 mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" /> Horas Deslocamento (h)
            </label>
            <input
              type="number" step="0.1" value={horasDeslocamento || ''}
              onChange={(e) => onDeslocamentoChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-blue-300 rounded-lg font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-xl">
        <span className="text-gray-600 text-[11px]">Foto do Painel / Horímetro (Google Drive)</span>
        <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold text-[11px] cursor-pointer">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : fotoUrl ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Camera className="w-3 h-3" />}
          <span>{uploading ? 'Enviando...' : fotoUrl ? 'Foto Anexada' : 'Adicionar Foto'}</span>
          <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
    </div>
  );
};

