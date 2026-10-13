import React, { useRef, useState } from 'react';
import { PenTool, Trash2, CheckCircle2, AlertCircle, Upload, Edit3 } from 'lucide-react';
import { otimizarImagemLogo } from '../../../utils/logoImageService';
import { AssinaturaCanvasModal } from '../../ui/AssinaturaCanvasModal';

interface EmpresaAssinaturaUploadProps {
  assinaturaUrl?: string | null;
  onChangeAssinatura: (url: string | null) => void;
  disabled?: boolean;
}

export const EmpresaAssinaturaUpload: React.FC<EmpresaAssinaturaUploadProps> = ({
  assinaturaUrl,
  onChangeAssinatura,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [modalDesenhoAberto, setModalDesenhoAberto] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErroLocal('Selecione um arquivo de imagem válido (PNG transparente ou JPG).');
      return;
    }
    try {
      setProcessando(true);
      setErroLocal(null);
      const dataUrl = await otimizarImagemLogo(file);
      onChangeAssinatura(dataUrl);
    } catch (err: unknown) {
      setErroLocal(err instanceof Error ? err.message : 'Falha ao processar a assinatura.');
    } finally {
      setProcessando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-emerald-600" />
            <span>Assinatura Digital / Rubrica da Empresa</span>
          </h4>
          <p className="text-[11px] text-gray-500">
            Pode ser desenhada diretamente na tela com o dedo/mouse ou carregada como imagem.
          </p>
        </div>
        {assinaturaUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Assinatura Ativa
          </span>
        )}
      </div>

      {erroLocal && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{erroLocal}</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" disabled={disabled || processando} />

      {assinaturaUrl ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-48 h-16 bg-slate-50 border border-gray-100 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
            <img src={assinaturaUrl} alt="Assinatura Digital" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button" onClick={() => setModalDesenhoAberto(true)} disabled={disabled || processando}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Desenhar Novamente</span>
            </button>
            <button
              type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || processando}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{processando ? 'Processando...' : 'Carregar Arquivo'}</span>
            </button>
            <button
              type="button" onClick={() => onChangeAssinatura(null)} disabled={disabled || processando}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button" onClick={() => !disabled && !processando && setModalDesenhoAberto(true)}
            className="p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Edit3 className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">Desenhar na Tela Agora</span>
            <span className="text-[10px] text-emerald-600">Assine usando o dedo no celular ou o mouse</span>
          </button>

          <button
            type="button" onClick={() => !disabled && !processando && fileInputRef.current?.click()}
            className="p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Upload className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-bold text-gray-700">Carregar Arquivo de Imagem</span>
            <span className="text-[10px] text-gray-400">PNG transparente, JPG ou WebP</span>
          </button>
        </div>
      )}

      <AssinaturaCanvasModal
        isOpen={modalDesenhoAberto}
        onClose={() => setModalDesenhoAberto(false)}
        onSave={(dataUrl) => onChangeAssinatura(dataUrl)}
      />
    </div>
  );
};
