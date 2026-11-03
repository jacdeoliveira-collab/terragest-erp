import React from 'react';
import { Camera } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';

interface ServicoHorimetroCellProps {
  horimetroInicial: number;
  horimetroFinal: number | null;
  alertaPainel?: string;
  maquinaNome?: string;
  fotoInicial?: string;
  fotoFinal?: string;
}

export const ServicoHorimetroCell: React.FC<ServicoHorimetroCellProps> = ({
  horimetroInicial,
  horimetroFinal,
  alertaPainel,
  maquinaNome,
  fotoInicial,
  fotoFinal
}) => {
  const temIni = Boolean(fotoInicial && String(fotoInicial).trim().length > 0);
  const temFim = Boolean(fotoFinal && String(fotoFinal).trim().length > 0);

  return (
    <td className="py-3 px-3 font-mono text-center">
      <span className="text-gray-700">{Number(horimetroInicial || 0).toFixed(1)} h</span>
      <span className="text-gray-400 mx-1">➔</span>
      <span className="text-gray-900 font-bold">
        {horimetroFinal !== null ? `${Number(horimetroFinal).toFixed(1)} h` : 'Em curso'}
      </span>
      {alertaPainel && <span className="block text-[9px] text-amber-600 font-sans mt-0.5">⚠️ {alertaPainel}</span>}

      {(temIni || temFim) && (
        <div className="flex items-center justify-center gap-1 mt-1 font-sans flex-wrap">
          {temIni && (
            <button
              type="button"
              onClick={() => abrirVisualizacaoImagem(fotoInicial, `Foto Horímetro Inicial - ${maquinaNome || ''}`)}
              title="Foto Horímetro Inicial (Google Drive / Nuvem)"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border cursor-pointer bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-2xs"
            >
              <Camera className="w-2.5 h-2.5" />
              <span>Ini</span>
            </button>
          )}
          {temFim && (
            <button
              type="button"
              onClick={() => abrirVisualizacaoImagem(fotoFinal, `Foto Horímetro Final - ${maquinaNome || ''}`)}
              title="Foto Horímetro Final (Google Drive / Nuvem)"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border cursor-pointer bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs"
            >
              <Camera className="w-2.5 h-2.5" />
              <span>Fim</span>
            </button>
          )}
        </div>
      )}
    </td>
  );
};
