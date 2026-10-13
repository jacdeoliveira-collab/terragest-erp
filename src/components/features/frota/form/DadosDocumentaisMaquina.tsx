import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface Props {
  chassi: string; setChassi: (val: string) => void;
  renavam: string; setRenavam: (val: string) => void;
  anoFabricacao: string; setAnoFabricacao: (val: string) => void;
  laudoArtValidade: string; setLaudoArtValidade: (val: string) => void;
  seguroApolice: string; setSeguroApolice: (val: string) => void;
  seguroValidade: string; setSeguroValidade: (val: string) => void;
  tagRastreador: string; setTagRastreador: (val: string) => void;
  arquivoFoto: File | null; setArquivoFoto: (file: File | null) => void;
  driveUrlFoto?: string;
}

export const DadosDocumentaisMaquina: React.FC<Props> = ({
  chassi, setChassi, renavam, setRenavam, anoFabricacao, setAnoFabricacao,
  laudoArtValidade, setLaudoArtValidade, seguroApolice, setSeguroApolice,
  seguroValidade, setSeguroValidade, tagRastreador, setTagRastreador,
  arquivoFoto, setArquivoFoto, driveUrlFoto
}) => {
  return (
    <div className="space-y-3">
      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
        Blindagem jurídica, conformidade NR-12/NR-18, apólices de seguro e telemetria GPS da máquina.
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Chassi (VIN)</label>
          <input
            placeholder="Ex: 9BWZZZ377VT..."
            value={chassi}
            onChange={(e) => setChassi(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">RENAVAM</label>
          <input
            placeholder="Ex: 00987654321"
            value={renavam}
            onChange={(e) => setRenavam(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ano Fabricação</label>
          <input
            type="number"
            placeholder="Ex: 2023"
            value={anoFabricacao}
            onChange={(e) => setAnoFabricacao(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Validade Laudo NR-12 / ART</label>
          <input
            type="date"
            value={laudoArtValidade}
            onChange={(e) => setLaudoArtValidade(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tag Rastreador / GPS</label>
          <input
            placeholder="Ex: SAT-99412"
            value={tagRastreador}
            onChange={(e) => setTagRastreador(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nº Apólice Seguro</label>
          <input
            placeholder="Ex: 01.077.123456"
            value={seguroApolice}
            onChange={(e) => setSeguroApolice(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Vencimento Seguro</label>
          <input
            type="date"
            value={seguroValidade}
            onChange={(e) => setSeguroValidade(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Foto do Equipamento / Certificado Digital
          </span>
          {driveUrlFoto && (
            <a
              href={driveUrlFoto}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-700 underline font-bold hover:text-emerald-800"
            >
              Ver no Drive ↗
            </a>
          )}
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setArquivoFoto(e.target.files?.[0] || null)}
          className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
        />
      </div>

      {arquivoFoto && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Documento pronto: {arquivoFoto.name}</span>
        </div>
      )}
    </div>
  );
};
