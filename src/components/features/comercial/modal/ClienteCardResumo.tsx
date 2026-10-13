import React from 'react';
import { MapPin, Phone, FileText, Pencil } from 'lucide-react';
import type { Cliente } from '../../../../types/comercial.types';
import { extrairCoordenadasTexto } from '../../../../services/geocodingService';

interface ClienteCardResumoProps {
  cliente: Cliente;
  onEditar?: (c: Cliente) => void;
}

export const ClienteCardResumo: React.FC<ClienteCardResumoProps> = ({ cliente, onEditar }) => {
  const coords = cliente.endereco ? extrairCoordenadasTexto(cliente.endereco) : null;

  return (
    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-[11px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-700">
        {cliente.documento && (
          <span className="flex items-center gap-1 font-mono">
            <FileText className="w-3 h-3 text-emerald-600" />
            {cliente.documento}
          </span>
        )}
        {cliente.telefone && (
          <span className="flex items-center gap-1 font-mono">
            <Phone className="w-3 h-3 text-emerald-600" />
            {cliente.telefone}
          </span>
        )}
        {cliente.endereco && (
          <span className="flex items-center gap-1 text-gray-600 max-w-xs truncate">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            {coords ? (
              <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-emerald-700 truncate"
              >
                {cliente.endereco}
              </a>
            ) : (
              cliente.endereco
            )}
          </span>
        )}
      </div>
      {onEditar && (
        <button
          type="button"
          onClick={() => onEditar(cliente)}
          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer ml-2 shrink-0"
          title="Editar dados cadastrais deste cliente"
        >
          <Pencil className="w-3 h-3" />
          <span>Editar Cadastro</span>
        </button>
      )}
    </div>
  );
};
