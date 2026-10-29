import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { obterComprovante } from '../../../../services/comprovanteStorageService';

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
  const [temIni, setTemIni] = useState(false);
  const [temFim, setTemFim] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function validarFoto(url?: string): Promise<boolean> {
      if (!url || typeof url !== 'string' || url.trim().length === 0) return false;
      if (url.startsWith('https://drive.google.com') || url.startsWith('http')) return true;
      if (url.startsWith('idb://') || url.startsWith('ref_')) {
        const dados = await obterComprovante(url);
        return Boolean(dados && dados.length > 50);
      }
      if (url.startsWith('data:image/')) return true;
      return false;
    }

    validarFoto(fotoInicial).then((valido) => { if (ativo) setTemIni(valido); });
    validarFoto(fotoFinal).then((valido) => { if (ativo) setTemFim(valido); });

    return () => { ativo = false; };
  }, [fotoInicial, fotoFinal]);

  return (
    <td className="py-3 px-3 font-mono text-center">
      <span className="text-gray-700">{Number(horimetroInicial || 0).toFixed(1)} h</span>
      <span className="text-gray-400 mx-1">➔</span>
      <span className="text-gray-900 font-bold">
        {horimetroFinal !== null ? `${Number(horimetroFinal).toFixed(1)} h` : 'Em curso'}
      </span>
      {alertaPainel && <span className="block text-[9px] text-amber-600 font-sans mt-0.5">⚠️ {alertaPainel}</span>}

      {(temIni || temFim) && (
        <div className="flex items-center justify-center gap-1 mt-1 font-sans">
          {temIni && fotoInicial && (
            <button
              type="button"
              onClick={() => abrirVisualizacaoImagem(fotoInicial, `Foto Horímetro Inicial - ${maquinaNome || ''}`)}
              title="Foto Horímetro Inicial"
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[9px] font-semibold border border-blue-200 cursor-pointer"
            >
              <Camera className="w-2.5 h-2.5" /><span>Ini</span>
            </button>
          )}
          {temFim && fotoFinal && (
            <button
              type="button"
              onClick={() => abrirVisualizacaoImagem(fotoFinal, `Foto Horímetro Final - ${maquinaNome || ''}`)}
              title="Foto Horímetro Final"
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[9px] font-semibold border border-emerald-200 cursor-pointer"
            >
              <Camera className="w-2.5 h-2.5" /><span>Fim</span>
            </button>
          )}
        </div>
      )}
    </td>
  );
};
