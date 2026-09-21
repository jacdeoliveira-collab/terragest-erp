import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface DadosDocumentaisMaquinaProps {
  chassi: string;
  setChassi: (val: string) => void;
  renavam: string;
  setRenavam: (val: string) => void;
  anoFabricacao: string;
  setAnoFabricacao: (val: string) => void;
  arquivoFoto: File | null;
  setArquivoFoto: (file: File | null) => void;
  driveUrlFoto?: string;
}

export const DadosDocumentaisMaquina: React.FC<DadosDocumentaisMaquinaProps> = ({
  chassi,
  setChassi,
  renavam,
  setRenavam,
  anoFabricacao,
  setAnoFabricacao,
  arquivoFoto,
  setArquivoFoto,
  driveUrlFoto
}) => {
  return (
    <div className="space-y-3">
      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
        Informações de blindagem patrimonial, trânsito e registro fiscal da máquina/veículo.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Chassi (VIN)</label>
          <input
            placeholder="Ex: 9BWZZZ377VT004251"
            value={chassi}
            onChange={(e) => setChassi(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">RENAVAM</label>
          <input
            placeholder="Ex: 00987654321"
            value={renavam}
            onChange={(e) => setRenavam(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ano de Fabricação</label>
          <input
            type="number"
            placeholder="Ex: 2023"
            value={anoFabricacao}
            onChange={(e) => setAnoFabricacao(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col justify-end">
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Foto da Máquina (Drive)
            </span>
            {driveUrlFoto && (
              <span className="text-[10px] text-emerald-700 font-normal">Foto existente</span>
            )}
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setArquivoFoto(e.target.files?.[0] || null)}
            className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
        </div>
      </div>

      {arquivoFoto && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Foto pronta para upload: {arquivoFoto.name}</span>
        </div>
      )}
    </div>
  );
};
