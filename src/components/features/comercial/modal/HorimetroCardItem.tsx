import React from 'react';
import { Gauge, Camera, X, Sparkles } from 'lucide-react';

interface HorimetroCardItemProps {
  titulo: string;
  badge: string;
  badgeClass: string;
  valor: number | undefined;
  onChangeValor: (val: number | undefined) => void;
  placeholder: string;
  fotoUrl: string | undefined;
  onLimparFoto: () => void;
  uploadingImage: string | null;
  uploadKey: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accentColor: string;
  isKm?: boolean;
}

export const HorimetroCardItem: React.FC<HorimetroCardItemProps> = ({
  titulo, badge, badgeClass, valor, onChangeValor, placeholder,
  fotoUrl, onLimparFoto, uploadingImage, uploadKey, onUpload, accentColor, isKm
}) => {
  const isProcessando = uploadingImage === uploadKey;

  return (
    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800 flex items-center gap-1.5">
          <Gauge className={`w-3.5 h-3.5 ${accentColor}`} />
          {titulo}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      </div>

      <div>
        <label className="block text-[11px] text-gray-600 mb-1">
          {isKm ? 'Leitura do Painel (KM)' : 'Leitura do Painel (h)'}
        </label>
        <input
          type="number"
          step={isKm ? "1" : "0.1"}
          value={valor ?? ''}
          onChange={(e) => onChangeValor(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm font-bold text-gray-800"
          placeholder={placeholder}
        />
      </div>

      <div>
        <label className="block text-[11px] text-gray-600 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Foto do Painel (Leitor OCR Automático)
          </span>
          {fotoUrl && <span className="text-[10px] text-emerald-700 font-semibold">Salva</span>}
        </label>
        <div className="flex items-center gap-2">
          <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed rounded-lg cursor-pointer transition-all ${
            isProcessando ? 'border-emerald-500 bg-emerald-50 text-emerald-700 animate-pulse' : 'border-gray-300 hover:border-emerald-500 bg-white text-gray-600'
          }`}>
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">
              {isProcessando ? 'Lendo painel com OCR...' : 'Tirar / Anexar Foto (OCR)'}
            </span>
            <input type="file" accept="image/*" disabled={uploadingImage !== null} className="hidden" onChange={onUpload} />
          </label>
          {fotoUrl && (
            <button type="button" onClick={onLimparFoto} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Remover Foto">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {fotoUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-28 bg-gray-100 flex items-center justify-center">
            <img src={fotoUrl} alt={titulo} className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};
