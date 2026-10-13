import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export const AssinaturaCanvasModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [desenhando, setDesenhando] = useState(false);
  const [temTraco, setTemTraco] = useState(false);

  const limparCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTemTraco(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => limparCanvas(), 50);
    }
  }, [isOpen, limparCanvas]);

  if (!isOpen) return null;

  const obterCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches.length > 0) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    const me = e as React.MouseEvent<HTMLCanvasElement>;
    return { x: (me.clientX - rect.left) * scaleX, y: (me.clientY - rect.top) * scaleY };
  };

  const iniciarTraco = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = obterCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    setDesenhando(true);
  };

  const desenhar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!desenhando) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = obterCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setTemTraco(true);
  };

  const finalizarTraco = () => {
    setDesenhando(false);
  };

  const handleSalvar = () => {
    const canvas = canvasRef.current;
    if (!canvas || !temTraco) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs text-xs text-left">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Desenhar Assinatura na Tela</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gray-500">
            Assine com o dedo (no celular/tablet) ou usando o mouse dentro do quadro abaixo:
          </p>

          <div className="relative border-2 border-dashed border-emerald-300 rounded-xl bg-slate-50/50 overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              className="w-full h-44 cursor-crosshair block"
              onMouseDown={iniciarTraco}
              onMouseMove={desenhar}
              onMouseUp={finalizarTraco}
              onMouseLeave={finalizarTraco}
              onTouchStart={iniciarTraco}
              onTouchMove={desenhar}
              onTouchEnd={finalizarTraco}
            />
            <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-gray-300 pointer-events-none" />
            <span className="absolute bottom-1 right-3 text-[9px] text-gray-400 pointer-events-none">
              Linha da assinatura
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button type="button" onClick={limparCanvas} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Limpar</span>
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200/60 rounded-xl font-medium cursor-pointer">
              Cancelar
            </button>
            <button
              type="button" onClick={handleSalvar} disabled={!temTraco}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Assinatura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
