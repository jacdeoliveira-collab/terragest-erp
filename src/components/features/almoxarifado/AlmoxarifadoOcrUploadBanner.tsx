import React from 'react';
import { Camera, CheckCircle2, RefreshCw, Upload, ExternalLink } from 'lucide-react';

interface Props {
  lendoOcr: boolean;
  mensagemSucesso: string | null;
  comprovanteUrl?: string;
  onUploadArquivo: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AlmoxarifadoOcrUploadBanner: React.FC<Props> = ({
  lendoOcr,
  mensagemSucesso,
  comprovanteUrl,
  onUploadArquivo
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">Preenchimento Automático por Imagem / PDF</div>
            <div className="text-[11px] text-emerald-700">Leitor OCR 100% Local e Offline para NF-e e Tickets de Balança</div>
          </div>
        </div>

        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0">
          <Upload className="w-3.5 h-3.5" />
          <span>{lendoOcr ? 'Lendo...' : comprovanteUrl ? 'Trocar Arquivo' : 'Carregar Nota / Ticket'}</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={onUploadArquivo}
            disabled={lendoOcr}
            className="hidden"
          />
        </label>
      </div>

      {lendoOcr && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />
          <span>Processando imagem/PDF e extraindo dados com OCR local (sem envio para nuvem)...</span>
        </div>
      )}

      {mensagemSucesso && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{mensagemSucesso}</span>
          </div>
          {comprovanteUrl && (
            <a
              href={comprovanteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline shrink-0"
            >
              <span>Ver Anexo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
