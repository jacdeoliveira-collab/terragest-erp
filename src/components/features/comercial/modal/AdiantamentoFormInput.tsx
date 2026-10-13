import React, { useState } from 'react';
import { Plus, Camera, X } from 'lucide-react';
import { comprimirImagem } from '../../../../services/comprovanteStorageService';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';

interface Props {
  onAdicionar: (item: Omit<AdiantamentoItem, 'id'>) => Promise<void> | void;
  isFirst: boolean;
}

export const AdiantamentoFormInput: React.FC<Props> = ({ onAdicionar, isFirst }) => {
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState('PIX');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState('');
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCarregandoFoto(true);
      const b64 = await comprimirImagem(file);
      setComprovante(b64);
    } catch {
      const r = new FileReader();
      r.onload = () => typeof r.result === 'string' && setComprovante(r.result);
      r.readAsDataURL(file);
    } finally {
      setCarregandoFoto(false);
    }
  };

  const handleSubmit = () => {
    const v = parseFloat(valor);
    if (!v || v <= 0) return;
    onAdicionar({
      valor: v, forma_pagamento: forma,
      data: data || new Date().toISOString().slice(0, 10),
      observacao: obs.trim() || (isFirst ? 'Sinal / Entrada' : 'Parcela / A Haver'),
      comprovante_url: comprovante
    });
    setValor(''); setObs(''); setComprovante(undefined);
  };

  return (
    <div className="p-2.5 bg-white border border-emerald-200 rounded-lg space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Valor (R$) *</label>
          <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-mono font-bold text-emerald-700" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Forma de Pagto</label>
          <select value={forma} onChange={(e) => setForma(e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg">
            <option value="PIX">PIX</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
            <option value="Boleto">Boleto</option>
            <option value="Cartão">Cartão</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Data Pagamento</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Identificação / Obs</label>
          <input type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: 2ª Parcela PIX" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-gray-300 hover:border-emerald-500 rounded-lg cursor-pointer text-[11px] text-gray-600 hover:text-emerald-700 bg-gray-50">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>{carregandoFoto ? 'Processando...' : comprovante ? 'Comprovante Anexado ✓' : 'Anexar Comprovante'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleFoto} className="hidden" />
          </label>
          {comprovante && (
            <button type="button" onClick={() => setComprovante(undefined)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Gravar Pagamento</span>
        </button>
      </div>
    </div>
  );
};
