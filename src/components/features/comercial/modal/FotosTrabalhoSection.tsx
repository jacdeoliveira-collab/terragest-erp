import React, { useState } from 'react';
import { Camera, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { FotoTrabalhoItem } from '../../../../types/servicoHorimetro.types';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { notificarFalhaDrive } from '../../../../utils/driveFeedback';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';

interface FotosTrabalhoSectionProps {
  fotos: FotoTrabalhoItem[];
  onChangeFotos: (fotos: FotoTrabalhoItem[]) => void;
}

function resolverThumbUrl(url: string): string {
  if (!url || url.startsWith('idb://') || url.startsWith('ref_')) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/[-\w]{25,}/);
    if (match) return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w400`;
  }
  return url;
}

export const FotosTrabalhoSection: React.FC<FotosTrabalhoSectionProps> = ({
  fotos = [],
  onChangeFotos,
}) => {
  const [slotCarregando, setSlotCarregando] = useState<number | null>(null);

  const slots: FotoTrabalhoItem[] = [0, 1, 2, 3].map((i) => {
    return fotos[i] || { url: '', legenda: '' };
  });

  const handleUploadSlot = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlotCarregando(index);
    try {
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) {
        const novas = [...slots];
        novas[index] = {
          ...novas[index],
          url: res.driveUrl,
          legenda: novas[index].legenda || `Foto ${index + 1} - Execução da Obra`,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        };
        onChangeFotos(novas.filter((f) => f.url));
      } else {
        notificarFalhaDrive(res.erro, false);
      }
    } finally {
      setSlotCarregando(null);
    }
  };

  const handleLegendaChange = (index: number, legenda: string) => {
    const novas = [...slots];
    novas[index] = { ...novas[index], legenda };
    onChangeFotos(novas.filter((f) => f.url));
  };

  const handleRemover = (index: number) => {
    const novas = [...slots];
    novas[index] = { url: '', legenda: '' };
    onChangeFotos(novas.filter((f) => f.url));
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fotos do Trabalho para o Relatório do Cliente (Até 4 Fotos)</span>
          </h4>
          <p className="text-[11px] text-gray-500">
            Anexe imagens do andamento e conclusão do serviço com legendas explicativas para o relatório final.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          {fotos.filter((f) => f.url).length} / 4 Anexadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot, idx) => {
          const temFoto = !!slot.url;
          const estaCarregando = slotCarregando === idx;
          const thumbUrl = resolverThumbUrl(slot.url);

          return (
            <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/60 hover:bg-gray-50 space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-emerald-600" />Foto {idx + 1}
                </span>
                {temFoto && !estaCarregando && (
                  <button type="button" onClick={() => handleRemover(idx)} className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50" title="Remover Foto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {estaCarregando ? (
                <div className="flex flex-col items-center justify-center h-28 border border-gray-200 rounded-lg bg-white">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-1" />
                  <span className="text-[11px] text-gray-500 font-medium">Enviando para o Google Drive...</span>
                </div>
              ) : temFoto ? (
                <div className="space-y-2">
                  <div
                    onClick={() => abrirVisualizacaoImagem(slot.url, slot.legenda || `Foto ${idx + 1}`)}
                    className="relative h-28 w-full rounded-lg overflow-hidden border border-gray-200 bg-black/5 flex items-center justify-center cursor-pointer"
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold">Ver Foto Salva</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Digite a legenda da foto..."
                    value={slot.legenda}
                    onChange={(e) => handleLegendaChange(idx, e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg cursor-pointer bg-white transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-[11px] font-semibold text-gray-600">Clique para anexar foto</span>
                  <span className="text-[9px] text-gray-400">Enviada direto para o Google Drive</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadSlot(idx, e)} />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
