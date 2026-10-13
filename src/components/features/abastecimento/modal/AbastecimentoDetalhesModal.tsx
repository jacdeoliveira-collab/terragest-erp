import React, { useState, useEffect } from 'react';
import { Modal } from '../../../ui/Modal';
import { Calendar, FileText, ExternalLink, Pencil, Trash2, Building, Tag } from 'lucide-react';
import { obterComprovante } from '../../../../services/comprovanteStorageService';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';
import { getMeasurementLabel, formatMeasurementValue } from '../../../../utils/equipmentMeasurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  abastecimento: AbastecimentoItem | null;
  onEditar?: (item: AbastecimentoItem) => void;
  onExcluir?: (item: AbastecimentoItem) => void;
}

export const AbastecimentoDetalhesModal: React.FC<Props> = ({
  isOpen, onClose, abastecimento, onEditar, onExcluir
}) => {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!abastecimento) return setFotoUrl(null);
    if (abastecimento.foto_comprovante) return setFotoUrl(abastecimento.foto_comprovante);
    const matchCupom = abastecimento.numero_requisicao_nf?.match(/\[REF:(CUP_[A-Z0-9]+)/);
    if (matchCupom?.[1]) {
      obterComprovante(matchCupom[1]).then((res) => { if (res) setFotoUrl(res); });
    } else {
      setFotoUrl(null);
    }
  }, [abastecimento]);

  if (!abastecimento) return null;

  const precoPorLitro = abastecimento.quantidade_litros > 0
    ? (Number(abastecimento.valor_total) / Number(abastecimento.quantidade_litros)).toFixed(3)
    : '0.000';
  const docLimpo = abastecimento.numero_requisicao_nf?.replace(/\[FOTO:.*?\]/g, '')?.replace(/\[REF:.*?\]/g, '')?.trim() || '-';
  const isPdf = Boolean(fotoUrl && (fotoUrl.includes('application/pdf') || fotoUrl.toLowerCase().includes('.pdf')));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Abastecimento: #AB-${abastecimento.id.slice(0, 8).toUpperCase()}`}>
      <div className="space-y-4 text-xs text-left">
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-800">#AB-{abastecimento.id.slice(0, 8).toUpperCase()}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {abastecimento.tipo_combustivel.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{abastecimento.data}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
            <div className="text-[11px] text-emerald-700 font-medium mb-1">Litros Abastecidos</div>
            <div className="text-base font-bold font-mono text-emerald-900">{Number(abastecimento.quantidade_litros).toFixed(1)} L</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] text-slate-600 font-medium mb-1">Valor Total</div>
            <div className="text-base font-bold font-mono text-slate-900">R$ {Number(abastecimento.valor_total).toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">R$ {precoPorLitro}/L</div>
          </div>
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3">
            <div className="text-[11px] text-blue-700 font-medium mb-1">Máquina / Veículo</div>
            <div className="font-bold text-blue-900 font-mono text-xs">{abastecimento.maquina_codigo || abastecimento.maquina_nome || '-'}</div>
            <div className="text-[10px] text-blue-600 truncate mt-0.5">{abastecimento.maquina_nome}</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3">
            <div className="text-[11px] text-amber-700 font-medium mb-1">
              {getMeasurementLabel({ name: abastecimento.maquina_nome, code: abastecimento.maquina_codigo })}
            </div>
            <div className="text-base font-bold font-mono text-amber-900">
              {abastecimento.horimetro_momento ? formatMeasurementValue(abastecimento.horimetro_momento, { name: abastecimento.maquina_nome, code: abastecimento.maquina_codigo }) : '-'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-gray-500 font-medium mb-0.5 flex items-center gap-1"><Building className="w-3.5 h-3.5 text-gray-400" /><span>Posto / Origem</span></div>
            <div className="font-semibold text-gray-800">{abastecimento.posto_fornecedor || abastecimento.origem || 'Não informado'}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium mb-0.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-gray-400" /><span>Número de NF / Cupom</span></div>
            <div className="font-mono text-gray-800">{docLimpo}</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-3">
          <div className="font-bold text-gray-800 text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-600" /><span>Comprovante Fiscal Anexado</span></span>
            {fotoUrl && (
              <a href={fotoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold">
                <span>Ver em Nova Aba</span><ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {fotoUrl ? (
            isPdf ? (
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                <iframe src={fotoUrl} title="Comprovante PDF" className="w-full h-56 rounded border border-gray-200 bg-white" />
                <a href={fotoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" /><span>Visualizar PDF Completo</span>
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-gray-900/5 rounded-lg p-2 border border-gray-200">
                <img src={fotoUrl} alt="Comprovante" className="max-h-56 w-auto rounded object-contain shadow-sm" />
              </div>
            )
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-lg">Nenhum comprovante fiscal fotográfico anexado.</div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {onEditar && (
              <button type="button" onClick={() => { onClose(); onEditar(abastecimento); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl font-semibold cursor-pointer border border-gray-200">
                <Pencil className="w-3.5 h-3.5" /><span>Editar</span>
              </button>
            )}
            {onExcluir && (
              <button type="button" onClick={() => { onClose(); onExcluir(abastecimento); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 rounded-xl font-semibold cursor-pointer border border-gray-200">
                <Trash2 className="w-3.5 h-3.5" /><span>Excluir</span>
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Fechar</button>
        </div>
      </div>
    </Modal>
  );
};
