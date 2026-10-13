import React from 'react';
import { MapPin, FileText, Compass } from 'lucide-react';

interface BDELocalizacaoTabProps {
  estacaInicial: string;
  setEstacaInicial: (val: string) => void;
  estacaFinal: string;
  setEstacaFinal: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  notes?: string;
  setNotes?: (val: string) => void;
}

const sugestoesAtividades = [
  'Escavação e carga de material de 1ª categoria',
  'Aterro, espalhamento e compactação de subleito',
  'Conformação e nivelamento de taludes',
  'Abertura e limpeza de valas de drenagem',
  'Bota-fora e limpeza de área de empréstimo'
];

export const BDELocalizacaoTab: React.FC<BDELocalizacaoTabProps> = ({
  estacaInicial,
  setEstacaInicial,
  estacaFinal,
  setEstacaFinal,
  description,
  setDescription,
  notes,
  setNotes
}) => {
  return (
    <div className="space-y-3.5 text-xs text-left">
      {/* Estaqueamento */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          Estaqueamento / Trecho de Infraestrutura
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Estaca Inicial
            </label>
            <input
              type="text"
              placeholder="Ex: Estaca 120+00 ou km 14.2"
              value={estacaInicial}
              onChange={(e) => setEstacaInicial(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-600" /> Estaca Final
            </label>
            <input
              type="text"
              placeholder="Ex: Estaca 135+00 ou km 14.5"
              value={estacaFinal}
              onChange={(e) => setEstacaFinal(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Descrição dos Serviços */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          Descrição das Atividades Executadas *
        </label>
        <textarea
          required
          rows={3}
          placeholder="Descreva minuciosamente o serviço de campo executado pelo equipamento..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
        />

        {/* Sugestões rápidas */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {sugestoesAtividades.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => setDescription(description ? `${description}; ${sugestao}` : sugestao)}
              className="px-2 py-0.5 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-800 rounded-md text-[10px] cursor-pointer transition-colors"
            >
              + {sugestao}
            </button>
          ))}
        </div>
      </div>

      {setNotes && (
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Observações Adicionais (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: Operou com esteira desgastada / Clima nublado à tarde"
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
          />
        </div>
      )}
    </div>
  );
};
