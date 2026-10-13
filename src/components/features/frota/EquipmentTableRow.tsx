import React from 'react';
import { ExternalLink, ShieldAlert, ShieldCheck, Edit, Trash2 } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';
import { formatMeasurementValue } from '../../../utils/equipmentMeasurement';

interface EquipmentTableRowProps {
  item: Equipment;
  onSelect?: (item: Equipment) => void;
  onEdit?: (item: Equipment) => void;
  onDelete?: (id: string) => void;
}

export const EquipmentTableRow: React.FC<EquipmentTableRowProps> = ({
  item,
  onSelect,
  onEdit,
  onDelete
}) => {
  const isLocado = item.tipo_propriedade === 'LOCADO';
  const laudoVencido = item.laudo_art_validade ? new Date(item.laudo_art_validade) < new Date() : false;

  return (
    <tr className="hover:bg-emerald-50/40 transition-colors">
      <td 
        onClick={() => onSelect?.(item)}
        className="p-3.5 font-mono font-bold text-emerald-700 cursor-pointer hover:underline"
        title="Clique para abrir Ficha 360° e histórico desta máquina"
      >
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
            {item.code}
          </span>
        </div>
        <div className="text-[10px] font-normal text-gray-500 mt-0.5">{item.type}</div>
      </td>
      <td 
        onClick={() => onSelect?.(item)}
        className="p-3.5 cursor-pointer"
        title="Clique para abrir Ficha 360° e histórico desta máquina"
      >
        <div className="font-semibold text-gray-900 hover:text-emerald-700 transition-colors">{item.name}</div>
        <div className="text-[11px] text-gray-500 font-mono">
          {item.marca ? `${item.marca} • ` : ''}{item.model}
          {item.placa ? ` | Placa: ${item.placa}` : item.serial_number ? ` | Série: ${item.serial_number}` : ''}
        </div>
      </td>
      <td className="p-3.5 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          isLocado ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {isLocado ? 'LOCADO' : 'PRÓPRIO'}
        </span>
        {isLocado && item.fornecedor_locacao && (
          <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{item.fornecedor_locacao}</div>
        )}
      </td>
      <td className="p-3.5 text-right font-mono font-semibold text-gray-900">
        {formatMeasurementValue(item.current_hourmeter, item)}
      </td>
      <td className="p-3.5 text-center">
        {item.laudo_art_validade ? (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            laudoVencido ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {laudoVencido ? <ShieldAlert className="w-3 h-3 text-rose-600" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
            {laudoVencido ? 'ART Vencida' : 'ART Válida'}
          </span>
        ) : (
          <span className="text-gray-400 text-[10px] font-mono">Não Cadastrado</span>
        )}
      </td>
      <td className="p-3.5 text-center">
        {item.drive_url_foto ? (
          <a
            href={item.drive_url_foto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Doc</span>
          </a>
        ) : (
          <span className="text-gray-400 font-mono">-</span>
        )}
      </td>
      <td className="p-3.5 text-center">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {item.status}
        </span>
      </td>
      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="px-2 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Ficha 360° e Documentos"
            >
              Docs / Ficha
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              title="Editar Equipamento"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              title="Excluir Equipamento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
