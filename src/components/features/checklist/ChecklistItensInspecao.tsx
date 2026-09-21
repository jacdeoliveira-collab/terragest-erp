import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ChecklistItensInspecaoProps {
  nivelOleoOk: boolean;
  setNivelOleoOk: (val: boolean) => void;
  vazamentosOk: boolean;
  setVazamentosOk: (val: boolean) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
  statusGeralAprovado: boolean;
  setStatusGeralAprovado: (val: boolean) => void;
}

export const ChecklistItensInspecao: React.FC<ChecklistItensInspecaoProps> = ({
  nivelOleoOk,
  setNivelOleoOk,
  vazamentosOk,
  setVazamentosOk,
  observacoes,
  setObservacoes,
  statusGeralAprovado,
  setStatusGeralAprovado
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
        <label className="flex items-center justify-between text-xs font-medium text-gray-800 cursor-pointer">
          <span>Nível de Óleo do Motor / Hidráulico OK?</span>
          <input
            type="checkbox"
            checked={nivelOleoOk}
            onChange={(e) => setNivelOleoOk(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-xs font-medium text-gray-800 cursor-pointer">
          <span>Isento de Vazamentos Visíveis?</span>
          <input
            type="checkbox"
            checked={vazamentosOk}
            onChange={(e) => setVazamentosOk(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Observações de Campo</label>
        <input
          placeholder="Ex: Nível de graxa adequado, esteira ajustada"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Resultado da Inspeção *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatusGeralAprovado(true)}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              statusGeralAprovado
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Aprovado</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusGeralAprovado(false)}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              !statusGeralAprovado
                ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Reprovado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
