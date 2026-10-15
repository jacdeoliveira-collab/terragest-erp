import React, { useState } from 'react';
import { Building, Wrench, Camera, Upload, X } from 'lucide-react';
import type { Obra } from '../../../../types/obra.types';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { comprimirImagem } from '../../../../services/comprovanteStorageService';

interface Props {
  obraId: string;
  setObraId: (v: string) => void;
  servicoId: string;
  setServicoId: (v: string) => void;
  fotoComprovante?: string;
  setFotoComprovante: (v: string | undefined) => void;
  obras: Obra[];
  servicos: ServicoHorimetro[];
}

export const AbastecimentoEditVinculoFields: React.FC<Props> = ({
  obraId, setObraId, servicoId, setServicoId, fotoComprovante, setFotoComprovante, obras, servicos
}) => {
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCarregandoFoto(true);
      const b64 = await comprimirImagem(file);
      setFotoComprovante(b64);
    } catch {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') setFotoComprovante(reader.result); };
      reader.readAsDataURL(file);
    } finally {
      setCarregandoFoto(false);
    }
  };

  return (
    <div className="space-y-3 pt-1 border-t border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-600" /> Centro de Custo / Obra
          </label>
          <select
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
          >
            <option value="">Geral / Empresa (Sem obra específica)</option>
            {obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-amber-600" /> Vincular a Serviço (Cliente)
          </label>
          <select
            value={servicoId}
            onChange={(e) => {
              setServicoId(e.target.value);
              const s = servicos.find((srv) => srv.id === e.target.value);
              if (s?.obra_id && !obraId) setObraId(s.obra_id);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-medium"
          >
            <option value="">Nenhum (Frota / Custo Geral)</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.cliente_nome} — {s.maquina_nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-gray-700 font-medium">
            {fotoComprovante ? 'Comprovante Fiscal Anexado' : 'Sem foto anexada'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fotoComprovante && (
            <>
              <button
                type="button"
                onClick={() => abrirVisualizacaoImagem(fotoComprovante, 'Comprovante Fiscal de Abastecimento')}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Ver Comprovante
              </button>
              <button
                type="button"
                onClick={() => setFotoComprovante(undefined)}
                title="Remover Comprovante"
                className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer transition-all">
            <Camera className="w-3 h-3" />
            <span>{carregandoFoto ? 'Anexando...' : fotoComprovante ? 'Trocar Foto' : 'Anexar Foto'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
