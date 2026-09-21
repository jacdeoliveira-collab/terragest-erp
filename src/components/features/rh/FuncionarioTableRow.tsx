import React from 'react';
import { AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { gerarFichaEpiPDF } from '../../../utils/epiPdfGenerator';
import type { Funcionario } from '../../../types/rh.types';

interface FuncionarioTableRowProps {
  item: Funcionario;
  hoje: string;
}

export const FuncionarioTableRow: React.FC<FuncionarioTableRowProps> = ({ item, hoje }) => {
  const docVencido = item.validade_documento ? item.validade_documento < hoje : false;

  const handleGerarEPI = () => {
    gerarFichaEpiPDF(item);
  };

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="p-3.5 font-medium text-gray-900">{item.nome}</td>
      <td className="p-3.5 text-gray-600">{item.cargo.replace('_', ' ')}</td>
      <td className="p-3.5 font-mono text-gray-500">{item.registro_documento || '-'}</td>
      <td className="p-3.5">
        {item.validade_documento ? (
          <span className={`inline-flex items-center gap-1 font-mono ${docVencido ? 'text-rose-600 font-bold' : 'text-gray-700'}`}>
            {docVencido && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
            {item.validade_documento}
            {docVencido && <span className="text-[10px] text-rose-500 uppercase">(Vencido)</span>}
          </span>
        ) : '-'}
      </td>
      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {item.drive_url_documentos ? (
            <a
              href={item.drive_url_documentos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors"
              title="Visualizar documento do colaborador"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ver PDF</span>
            </a>
          ) : (
            <span className="text-gray-400 font-mono">-</span>
          )}

          <button
            onClick={handleGerarEPI}
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            title="Gerar Ficha de EPI (NR-6)"
          >
            <Shield className="w-3 h-3 text-amber-600" />
            <span>Ficha EPI</span>
          </button>
        </div>
      </td>
      <td className="p-3.5 text-center">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {item.status}
        </span>
      </td>
    </tr>
  );
};
