import React, { useState } from 'react';
import { Trash2, Eye, X, Truck, Fuel } from 'lucide-react';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';

interface Props {
  itens: AbastecimentoItem[];
  onRemover: (id: string) => void;
  carregando?: boolean;
}

export const AbastecimentosListRows: React.FC<Props> = ({ itens, onRemover, carregando }) => {
  const [comprovanteModal, setComprovanteModal] = useState<string | null>(null);

  if (itens.length === 0) return null;

  return (
    <>
      <div className="divide-y divide-amber-100 bg-white border border-amber-200 rounded-lg max-h-44 overflow-y-auto">
        {itens.map((item, idx) => {
          const isApoio = isVehicleOrTruck({ code: item.maquina_codigo, name: item.maquina_nome }) ||
            item.tipo_combustivel === 'DIESEL_S10';

          return (
            <div key={item.id || idx} className="p-2 flex items-center justify-between hover:bg-amber-50/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 font-bold">{item.data}</span>
                <span className={`px-1.5 py-0.5 font-semibold rounded text-[10px] flex items-center gap-1 ${
                  isApoio ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {isApoio ? <Truck className="w-2.5 h-2.5" /> : <Fuel className="w-2.5 h-2.5" />}
                  {isApoio ? 'Apoio (S10)' : 'Máquina (S500)'}
                </span>
                <span className="text-gray-700 font-medium">
                  {item.posto_fornecedor || 'Posto de Combustível'}
                  {item.horimetro_momento ? ` • ${item.horimetro_momento}h` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-700">{Number(item.quantidade_litros).toFixed(1)} L</span>
                <span className="font-mono font-bold text-amber-900">
                  R$ {Number(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {item.foto_comprovante && (
                  <button
                    type="button" onClick={() => setComprovanteModal(item.foto_comprovante || null)}
                    title="Ver Cupom / Comprovante" className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button" onClick={() => onRemover(item.id)} disabled={carregando}
                  title="Remover Abastecimento" className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {comprovanteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs" onClick={() => setComprovanteModal(null)}>
          <div className="relative bg-white rounded-2xl p-2 max-w-lg max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setComprovanteModal(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80">
              <X className="w-4 h-4" />
            </button>
            <img src={comprovanteModal} alt="Comprovante de Combustível" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
};

