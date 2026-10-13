import React, { useState } from 'react';
import { KeyRound, Delete, Check, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Modal } from './Modal';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  operadorNome: string;
  operadorId?: string;
  expectedPin?: string;
  tituloAcao?: string;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  operadorNome,
  operadorId: _operadorId,
  expectedPin,
  tituloAcao = 'Assinatura Eletrônica'
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setErro(null);
      setPin(prev => prev + d);
    }
  };

  const handleDelete = () => {
    setErro(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setErro('Digite o PIN de 4 dígitos completo.');
      return;
    }
    const targetPin = expectedPin?.trim();
    if (targetPin && targetPin !== '' && pin !== targetPin) {
      setErro('PIN incorreto. Tente novamente.');
      setPin('');
      return;
    }
    setPin('');
    setErro(null);
    onSuccess();
  };

  const handleClose = () => {
    setPin('');
    setShowPin(false);
    setErro(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={tituloAcao}>
      <div className="space-y-4 text-center max-w-xs mx-auto py-1">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">{operadorNome}</h3>
          <p className="text-[11px] text-gray-500">
            {expectedPin?.trim()
              ? 'Informe seu PIN de 4 dígitos para validar o apontamento'
              : 'Colaborador sem PIN cadastrado (digite 4 dígitos quaisquer para validar).'}
          </p>
        </div>

        {/* Display do PIN com alternância de visibilidade */}
        <div className="space-y-1.5">
          <div className="flex justify-center gap-3 my-1">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-10 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all ${
                    hasDigit
                      ? 'bg-amber-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {hasDigit ? (showPin ? pin[index] : '•') : ''}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowPin((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-amber-700 transition-colors cursor-pointer"
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
            <span>{showPin ? 'Ocultar PIN' : 'Ver PIN'}</span>
          </button>
        </div>

        {erro && (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-center gap-1.5 animate-shake">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Teclado Touch-Friendly (Botões Grandes) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-gray-50 hover:bg-amber-50 active:bg-amber-200 text-gray-800 font-bold text-xl border border-gray-200 transition-all cursor-pointer flex items-center justify-center select-none"
            >
              {digit}
            </button>
          ))}

          <button type="button" onClick={handleDelete} className="h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all cursor-pointer flex items-center justify-center">
            <Delete className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => handleDigit('0')} className="h-14 rounded-2xl bg-gray-50 hover:bg-amber-50 active:bg-amber-200 text-gray-800 font-bold text-xl border border-gray-200 transition-all cursor-pointer flex items-center justify-center select-none">
            0
          </button>
          <button type="button" onClick={handleConfirm} disabled={pin.length !== 4} className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold border border-emerald-600 transition-all cursor-pointer flex items-center justify-center shadow-md">
            <Check className="w-6 h-6" />
          </button>
        </div>
        <div className="pt-2">
          <button type="button" onClick={handleClose} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
            Cancelar Assinatura
          </button>
        </div>
      </div>
    </Modal>
  );
};
