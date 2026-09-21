import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Equipment } from '../../../types/equipment.types';

interface EquipmentTableRowProps {
  item: Equipment;
}

export const EquipmentTableRow: React.FC<EquipmentTableRowProps> = ({ item }) => {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3.5 font-mono font-bold text-emerald-700">{item.code}</td>
      <td className="p-3.5 font-medium text-gray-900">{item.name}</td>
      <td className="p-3.5 text-gray-500">{item.model}</td>
      <td className="p-3.5 font-mono text-gray-500">{item.serial_number}</td>
      <td className="p-3.5 font-mono text-gray-500">{item.chassi || '-'}</td>
      <td className="p-3.5 font-mono text-gray-500">{item.renavam || '-'}</td>
      <td className="p-3.5 text-right font-mono font-semibold text-gray-900">
        {item.current_hourmeter.toFixed(1)} h
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
            <span>Ver Foto</span>
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
    </tr>
  );
};
