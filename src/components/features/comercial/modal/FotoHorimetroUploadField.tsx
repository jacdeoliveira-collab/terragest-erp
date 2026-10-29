import React, { useEffect, useState } from 'react';
import { Camera, X, ExternalLink } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { obterComprovante } from '../../../../services/comprovanteStorageService';

interface FotoHorimetroUploadFieldProps {
  label: string;
  badge: string;
  badgeClass: string;
  valorFoto?: string;
  inputId: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemover: () => void;
}

function resolverDriveThumbnail(url: string): string {
  if (url.includes('drive.google.com')) {
    const match = url.match(/[-\w]{25,}/);
    if (match) return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w300`;
  }
  return url;
}

export const FotoHorimetroUploadField: React.FC<FotoHorimetroUploadFieldProps> = ({
  badge,
  badgeClass,
  valorFoto,
  inputId,
  onUpload,
  onRemover
}) => {
  const [thumbSrc, setThumbSrc] = useState<string>('');

  useEffect(() => {
    let ativo = true;
    if (!valorFoto) {
      setThumbSrc('');
      return;
    }
    if (valorFoto.startsWith('idb://') || valorFoto.startsWith('ref_')) {
      obterComprovante(valorFoto).then((dados) => {
        if (ativo && dados) setThumbSrc(dados);
      });
      return;
    }
    setThumbSrc(resolverDriveThumbnail(valorFoto));
    return () => { ativo = false; };
  }, [valorFoto]);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={inputId}
          className="text-[10px] text-gray-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer bg-gray-100 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors border border-gray-200"
        >
          <Camera className="w-3 h-3 text-emerald-600" />
          <span>{valorFoto ? 'Trocar Foto' : 'Anexar Foto'}</span>
        </label>
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        {valorFoto && (
          <button
            type="button"
            onClick={onRemover}
            title="Remover foto"
            className="text-rose-500 hover:bg-rose-50 p-1 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {valorFoto && (
        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => abrirVisualizacaoImagem(valorFoto, `Foto do Painel - ${badge}`)}
            title="Clique para ver a foto em tamanho real"
            className="block shrink-0 relative group cursor-pointer"
          >
            <img
              src={thumbSrc || valorFoto}
              alt={badge}
              className="w-12 h-12 object-cover rounded-md border border-gray-300 shadow-xs group-hover:opacity-85 transition-opacity"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </button>
          <div className="flex-1 min-w-0 text-[10px]">
            <span className={`inline-block font-semibold px-1.5 py-0.5 rounded text-[9px] ${badgeClass}`}>
              {badge}
            </span>
            <p className="text-gray-500 mt-0.5 truncate">Foto do painel anexada</p>
            <button
              type="button"
              onClick={() => abrirVisualizacaoImagem(valorFoto, `Foto do Painel - ${badge}`)}
              className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver painel ampliado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

