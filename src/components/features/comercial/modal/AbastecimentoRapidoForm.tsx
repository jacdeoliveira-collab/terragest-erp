import React, { useState } from 'react';
import { Plus, Camera, X } from 'lucide-react';
import { comprimirImagem } from '../../../../services/comprovanteStorageService';

export interface NovoAbastecimentoRapidoDTO {
  data: string;
  tipo_alvo: 'MAQUINA' | 'APOIO';
  quantidade_litros: number;
  valor_total: number;
  horimetro_momento?: number;
  posto_fornecedor?: string;
  foto_comprovante?: string;
}

interface Props {
  onAdicionar: (item: NovoAbastecimentoRapidoDTO) => void;
  carregando?: boolean;
}

export const AbastecimentoRapidoForm: React.FC<Props> = ({ onAdicionar, carregando }) => {
  const [tipoAlvo, setTipoAlvo] = useState<'MAQUINA' | 'APOIO'>('MAQUINA');
  const [litros, setLitros] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [horimetro, setHorimetro] = useState('');
  const [posto, setPosto] = useState('Posto de Combustível / Cupom Fiscal');
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const b64 = await comprimirImagem(file);
      setComprovante(b64);
    } catch {
      const r = new FileReader();
      r.onload = () => typeof r.result === 'string' && setComprovante(r.result);
      r.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleGravar = () => {
    const l = parseFloat(litros);
    const v = parseFloat(valor);
    if (!l || l <= 0 || !v || v <= 0) return;

    onAdicionar({
      data: data || new Date().toISOString().slice(0, 10),
      tipo_alvo: tipoAlvo,
      quantidade_litros: l,
      valor_total: v,
      horimetro_momento: horimetro ? parseFloat(horimetro) : undefined,
      posto_fornecedor: posto || 'Posto de Combustível',
      foto_comprovante: comprovante
    });

    setLitros('');
    setValor('');
    setHorimetro('');
    setComprovante(undefined);
  };

  return (
    <div className="p-2.5 bg-white border border-amber-300 rounded-lg space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Destino</label>
          <select
            value={tipoAlvo}
            onChange={(e) => setTipoAlvo(e.target.value as 'MAQUINA' | 'APOIO')}
            className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-800"
          >
            <option value="MAQUINA">🚜 Máquina (S500)</option>
            <option value="APOIO">🛻 Apoio (S10)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Litros (L) *</label>
          <input
            type="number" step="0.01" min="0" value={litros}
            onChange={(e) => setLitros(e.target.value)} placeholder="0.00"
            className="w-full px-2 py-1 bg-gray-50 border border-amber-300 rounded-lg font-mono font-bold text-amber-900"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Valor Total (R$) *</label>
          <input
            type="number" step="0.01" min="0" value={valor}
            onChange={(e) => setValor(e.target.value)} placeholder="0.00"
            className="w-full px-2 py-1 bg-gray-50 border border-amber-300 rounded-lg font-mono font-bold text-emerald-800"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Data</label>
          <input
            type="date" value={data} onChange={(e) => setData(e.target.value)}
            className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Horímetro</label>
          <input
            type="number" step="0.1" min="0" value={horimetro}
            onChange={(e) => setHorimetro(e.target.value)} placeholder="Opcional"
            className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-mono"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-amber-100">
        <div className="flex items-center gap-2">
          <input
            type="text" value={posto} onChange={(e) => setPosto(e.target.value)}
            placeholder="Posto / Fornecedor / Cupom"
            className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-[11px] w-full sm:w-56"
          />
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-gray-300 hover:border-amber-500 rounded-lg cursor-pointer text-[11px] text-gray-600 bg-gray-50 shrink-0">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>{uploading ? 'Enviando...' : comprovante ? 'Comprovante ✓' : 'Cupom'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleFoto} className="hidden" />
          </label>
          {comprovante && (
            <button type="button" onClick={() => setComprovante(undefined)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button" onClick={handleGravar} disabled={carregando}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 font-bold rounded-lg shadow-xs cursor-pointer text-xs text-white bg-amber-600 hover:bg-amber-700 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{carregando ? 'Gravando...' : 'Adicionar Abastecimento'}</span>
        </button>
      </div>
    </div>
  );
};

