import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface DadosDocumentaisProps {
  cpf: string;
  setCpf: (val: string) => void;
  rg: string;
  setRg: (val: string) => void;
  cnh: string;
  setCnh: (val: string) => void;
  validadeCnh: string;
  setValidadeCnh: (val: string) => void;
  ctps: string;
  setCtps: (val: string) => void;
  asoValidade: string;
  setAsoValidade: (val: string) => void;
  arquivoDocumento: File | null;
  setArquivoDocumento: (file: File | null) => void;
  driveUrlDocumentos?: string;
}

export const DadosDocumentais: React.FC<DadosDocumentaisProps> = ({
  cpf,
  setCpf,
  rg,
  setRg,
  cnh,
  setCnh,
  validadeCnh,
  setValidadeCnh,
  ctps,
  setCtps,
  asoValidade,
  setAsoValidade,
  arquivoDocumento,
  setArquivoDocumento,
  driveUrlDocumentos
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">CPF (apenas números ou pontuado)</label>
          <input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">RG (Identidade)</label>
          <input
            placeholder="Ex: 12.345.678-9 SSP/SP"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">CNH (Número e Categoria)</label>
          <input
            placeholder="Ex: 01234567890 - Cat D/E"
            value={cnh}
            onChange={(e) => setCnh(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Validade da CNH *</label>
          <input
            type="date"
            value={validadeCnh}
            onChange={(e) => setValidadeCnh(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">CTPS (Nº e Série / Digital)</label>
          <input
            placeholder="Ex: 1234567 Série 001-0"
            value={ctps}
            onChange={(e) => setCtps(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Validade ASO (NR-7) *</label>
          <input
            type="date"
            value={asoValidade}
            onChange={(e) => setAsoValidade(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
        <label className="block font-semibold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Documentos Escaneados (Upload Google Drive)
          </span>
          {driveUrlDocumentos && (
            <span className="text-[10px] text-emerald-700 font-normal">Link existente salvo</span>
          )}
        </label>
        
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setArquivoDocumento(e.target.files?.[0] || null)}
          className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
        />

        {arquivoDocumento && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Arquivo pronto para upload: {arquivoDocumento.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
