import React from 'react';
import { FileText, Phone, MapPin } from 'lucide-react';
import type { Cliente } from '../../../types/comercial.types';

export const OrcamentoClienteCard: React.FC<{ cliente?: Cliente }> = ({ cliente }) => {
  if (!cliente) return null;
  return (
    <div className="p-2 bg-emerald-50/50 border border-emerald-200/70 rounded-xl flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-700">
      {cliente.documento && (
        <span className="flex items-center gap-1 font-mono"><FileText className="w-3 h-3 text-emerald-600" />{cliente.documento}</span>
      )}
      {cliente.telefone && (
        <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-emerald-600" />{cliente.telefone}</span>
      )}
      {cliente.endereco && (
        <span className="flex items-center gap-1 text-gray-600 truncate max-w-sm"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" />{cliente.endereco}</span>
      )}
    </div>
  );
};
