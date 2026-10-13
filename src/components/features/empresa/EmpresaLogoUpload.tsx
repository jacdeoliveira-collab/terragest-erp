import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { otimizarImagemLogo } from '../../../utils/logoImageService';

interface EmpresaLogoUploadProps {
  logoUrl?: string | null;
  onChangeLogo: (url: string | null) => void;
  disabled?: boolean;
}

export const EmpresaLogoUpload: React.FC<EmpresaLogoUploadProps> = ({
  logoUrl,
  onChangeLogo,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErroLocal('Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WebP).');
      return;
    }

    try {
      setProcessando(true);
      setErroLocal(null);
      const dataUrl = await otimizarImagemLogo(file);
      onChangeLogo(dataUrl);
    } catch (err: unknown) {
      setErroLocal(err instanceof Error ? err.message : 'Falha ao processar a imagem.');
    } finally {
      setProcessando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Logomarca da Empresa (Assinante)</span>
          </h4>
          <p className="text-[11px] text-gray-500">
            Impressa nos cabeçalhos de todos os relatórios, laudos e boletins gerados (PDF).
          </p>
        </div>
        {logoUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Logo Ativa
          </span>
        )}
      </div>

      {erroLocal && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{erroLocal}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || processando}
      />

      {logoUrl ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-40 h-20 bg-slate-50 border border-gray-100 rounded-lg p-2 flex items-center justify-center overflow-hidden shadow-2xs">
            <img src={logoUrl} alt="Logomarca da Empresa" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || processando}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              {processando ? 'Processando...' : 'Trocar Logomarca'}
            </button>
            <button
              type="button"
              onClick={() => onChangeLogo(null)}
              disabled={disabled || processando}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !processando && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-5 text-center cursor-pointer transition-colors"
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-gray-700">
            {processando ? 'Otimizando imagem...' : 'Clique para selecionar a logomarca da sua empresa'}
          </p>
          <span className="text-[10px] text-gray-400">PNG com fundo transparente, JPG ou WebP (máx. 5MB)</span>
        </div>
      )}
    </div>
  );
};
