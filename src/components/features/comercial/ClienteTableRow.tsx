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
      <td className="p-3.5 font-semibold text-gray-900 min-w-[220px]">
        <button
          type="button"
          onClick={() => onVerHistorico(cliente)}
          className="hover:underline hover:text-emerald-700 font-bold text-left cursor-pointer block"
          title="Clique para ver o resumo e serviços deste cliente"
        >
          {cliente.nome}
        </button>
        {cliente.email && <div className="text-[11px] font-normal text-gray-400">{cliente.email}</div>}
        <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onVerHistorico(cliente)}
            title="Ver Histórico & Serviços"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer"
          >
            <Eye className="w-3 h-3 text-emerald-600" />
            <span>Histórico</span>
          </button>
          <button
            type="button"
            onClick={() => onEditar(cliente)}
            title="Editar Cadastro"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
          >
            <Pencil className="w-3 h-3 text-amber-600" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onExcluir(cliente)}
            title="Excluir"
            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
    </tr>
  );
};
