import React, { useState } from 'react';
import { KeyRound, AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface DefinirPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioId: string;
  funcionarioNome: string;
  onSalvarPin: (id: string, pin: string) => Promise<{ success: boolean; error?: string }>;
}

export const DefinirPinModal: React.FC<DefinirPinModalProps> = ({
  isOpen, onClose, funcionarioId, funcionarioNome, onSalvarPin
}) => {
  const [novoPin, setNovoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const pinLimpo = novoPin.trim();
    if (!/^\d{4}$/.test(pinLimpo)) {
      setErro('O PIN deve conter exatamente 4 números (0-9).');
      return;
    }
    if (pinLimpo !== confirmarPin.trim()) {
      setErro('Os PINs digitados não conferem.');
      return;
    }

    setSalvando(true);
    const res = await onSalvarPin(funcionarioId, pinLimpo);
    setSalvando(false);
    if (res.success) {
      setSucesso(true);
      setTimeout(handleClose, 1000);
    } else {
      setErro(res.error || 'Falha ao salvar o PIN.');
    }
  };

  const handleClose = () => {
    setNovoPin('');
    setConfirmarPin('');
    setShowPin(false);
    setErro(null);
    setSucesso(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configurar PIN de Assinatura">
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs p-1">
        <div className="flex items-center gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 block">{funcionarioNome}</span>
            <span className="text-[11px] text-gray-500">PIN de 4 dígitos para assinatura em BDEs e Checklists</span>
          </div>
        </div>

        {erro && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>PIN atualizado com sucesso!</span>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-gray-700">Novo PIN (4 dígitos) *</label>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-[11px] text-gray-500 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPin ? 'Ocultar' : 'Visualizar'}</span>
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              required
              placeholder="••••"
              value={novoPin}
              onChange={(e) => setNovoPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-center tracking-widest text-base font-bold text-gray-900 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Confirmar PIN *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              required
              placeholder="••••"
              value={confirmarPin}
              onChange={(e) => setConfirmarPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono text-center tracking-widest text-base font-bold text-gray-900 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando || novoPin.length !== 4 || confirmarPin.length !== 4}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
          >
            {salvando ? 'Salvando...' : 'Salvar PIN'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
