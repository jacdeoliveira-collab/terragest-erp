import React from 'react';
import { Pencil, Trash2, MapPin, Eye } from 'lucide-react';
import { extrairCoordenadasTexto } from '../../../services/geocodingService';
import type { Cliente } from '../../../types/comercial.types';

interface Props {
  cliente: Cliente;
  onVerHistorico: (c: Cliente) => void;
  onEditar: (c: Cliente) => void;
  onExcluir: (c: Cliente) => void;
}

export const ClienteTableRow: React.FC<Props> = ({ cliente, onVerHistorico, onEditar, onExcluir }) => {
  const coords = cliente.endereco ? extrairCoordenadasTexto(cliente.endereco) : null;

  return (
    <tr className="hover:bg-emerald-50/40 transition-colors">
      <td
        onClick={() => onVerHistorico(cliente)}
        className="p-3.5 font-semibold text-gray-900 cursor-pointer hover:text-emerald-700"
        title="Clique para ver o resumo e serviços deste cliente"
      >
        <div className="hover:underline flex items-center gap-1.5">
          <span>{cliente.nome}</span>
        </div>
        {cliente.email && <div className="text-[11px] font-normal text-gray-400">{cliente.email}</div>}
      </td>
      <td
        onClick={() => onVerHistorico(cliente)}
        className="p-3.5 font-mono text-gray-600 cursor-pointer"
        title="Clique para ver o resumo e serviços deste cliente"
      >
        {cliente.documento || '-'}
      </td>
      <td className="p-3.5">{cliente.telefone || '-'}</td>
      <td className="p-3.5 text-gray-600 max-w-xs">
        {coords ? (
          <a
            href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
            title="Abrir no Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{cliente.endereco}</span>
          </a>
        ) : (
          cliente.endereco || '-'
        )}
      </td>
      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onVerHistorico(cliente)}
            title="Ver Histórico & Serviços"
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEditar(cliente)}
            title="Editar Cadastro"
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onExcluir(cliente)}
            title="Excluir"
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
