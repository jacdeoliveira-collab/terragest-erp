import React from 'react';
import { Modal } from '../../../ui/Modal';
import { Settings, RefreshCw, AlertCircle, Building2 } from 'lucide-react';
import { useObraDetalheHistorico } from '../../../../hooks/useObraDetalheHistorico';
import { ObraResumoCards } from './ObraResumoCards';
import { ObraResumoTables } from './ObraResumoTables';
import type { Obra } from '../../../../types/obras.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra | null;
  onEditar?: (obra: Obra) => void;
}

export const ObraResumoModal: React.FC<Props> = ({ isOpen, onClose, obra, onEditar }) => {
  const { data, isLoading, error, refetch } = useObraDetalheHistorico(obra);

  if (!obra) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Resumo do Centro de Custo: ${obra.nome}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10">
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{obra.cliente_nome || obra.cliente || 'Cliente não informado'}</span>
              {obra.cno && <span className="text-gray-500 font-normal font-mono">• CNO: {obra.cno}</span>}
              {obra.art_crea && <span className="text-gray-500 font-normal font-mono">• ART: {obra.art_crea}</span>}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-lg">
              {obra.endereco_completo || obra.localizacao || 'Sem endereço'} | Status: <strong className="text-emerald-700">{obra.status}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={refetch} title="Recarregar" className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onEditar && (
              <button
                type="button"
                onClick={() => { onClose(); onEditar(obra); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-200"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Editar Obra</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <ObraResumoCards data={data} />
        <ObraResumoTables data={data} />
      </div>
    </Modal>
  );
};
