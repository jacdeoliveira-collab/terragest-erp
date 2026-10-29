import React from 'react';
import { Truck, Zap, Clock, Calendar, Fuel, ShieldCheck, ExternalLink } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';
import { abrirVisualizacaoImagem } from '../../../utils/visualizadorImagem';

interface OrcamentoMaquinaCardProps {
  equipment?: Equipment | null;
}

function extrairDriveThumbnail(url?: string): string | null {
  if (!url || !url.includes('drive.google.com')) return url || null;
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w400` : url;
}

export const OrcamentoMaquinaCard: React.FC<OrcamentoMaquinaCardProps> = ({ equipment }) => {
  if (!equipment) return null;

  const thumbUrl = extrairDriveThumbnail(equipment.drive_url_foto);
  const serieOuChassi = equipment.serial_number || equipment.chassi || equipment.placa || 'N/A';

  return (
    <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2 text-xs animate-fade-in text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-lg bg-white border border-amber-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={equipment.name}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                onClick={() => equipment.drive_url_foto && abrirVisualizacaoImagem(equipment.drive_url_foto, equipment.name)}
                title="Clique para ampliar foto da máquina"
              />
            ) : (
              <Truck className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900 text-xs">{equipment.name}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                {equipment.code}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 font-medium">
              Modelo: <span className="font-semibold text-gray-800">{equipment.model || 'Linha Amarela'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> Frota Ativa
          </span>
          {equipment.drive_url_foto && (
            <a
              href={equipment.drive_url_foto}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Abrir foto/documento no Google Drive"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Grid de especificações técnicas do maquinário */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-700">
          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Potência: <b>{equipment.potencia_hp ? `${equipment.potencia_hp} HP` : 'Sob Consulta'}</b></span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Horímetro: <b>{equipment.current_hourmeter ? `${equipment.current_hourmeter} h` : '0.0 h'}</b></span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>Ano: <b>{equipment.ano_fabricacao || 'N/A'}</b></span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-700">
          <Fuel className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Tanque: <b>{equipment.capacidade_tanque ? `${equipment.capacidade_tanque} L` : 'Padrão'}</b></span>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
        <span>Série / Chassi: <b className="font-mono text-gray-700">{serieOuChassi}</b></span>
        {equipment.combustivel_padrao && (
          <span>Combustível: <b className="text-gray-700">{equipment.combustivel_padrao.replace('_', ' ')}</b></span>
        )}
      </div>
    </div>
  );
};
