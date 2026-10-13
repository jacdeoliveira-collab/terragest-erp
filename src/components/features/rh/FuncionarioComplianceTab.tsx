import React from 'react';
import { ExternalLink, Trash2, ShieldCheck, FileText, Info } from 'lucide-react';
import { useFuncionarioDocumentos } from '../../../hooks/useFuncionarioDocumentos';
import { FuncionarioDocumentoForm } from './FuncionarioDocumentoForm';
import type { FuncionarioDocumentoItem } from '../../../types/funcionarioDocumentos.types';

interface FuncionarioComplianceTabProps {
  funcionarioId?: string;
}

export const FuncionarioComplianceTab: React.FC<FuncionarioComplianceTabProps> = ({ funcionarioId }) => {
  const { documentos, isLoading, adicionarDocumento, excluirDocumento } = useFuncionarioDocumentos(funcionarioId);

  if (!funcionarioId) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl space-y-2">
        <Info className="w-8 h-8 text-gray-400 mx-auto" />
        <p className="text-xs font-semibold text-gray-700">Colaborador ainda não gravado</p>
        <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
          Salve os dados cadastrais do colaborador primeiro para poder anexar CNH, ASO e certificados.
        </p>
      </div>
    );
  }

  const getStatusValidade = (dataStr?: string | null) => {
    if (!dataStr) return { label: 'Indeterminado', cor: 'text-gray-500 bg-gray-50 border-gray-200' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(dataStr + 'T00:00:00');
    const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return { label: `VENCIDO (${Math.abs(diffDias)}d)`, cor: 'text-rose-700 bg-rose-50 border-rose-200 font-bold' };
    }
    if (diffDias <= 30) {
      return { label: `VENCE EM ${diffDias}d`, cor: 'text-amber-800 bg-amber-50 border-amber-200 font-bold' };
    }
    return { label: 'EM DIA', cor: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="space-y-4 text-xs text-left">
      <FuncionarioDocumentoForm onAdicionar={adicionarDocumento} />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Documentos, CNH e ASO ({documentos.length})
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-400">Carregando documentos...</div>
        ) : documentos.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Nenhum documento ou laudo anexado para este colaborador.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-[11px] font-semibold">
                  <th className="py-2 px-3">Documento</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Emissor / Clínica</th>
                  <th className="py-2 px-3">Validade</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documentos.map((doc: FuncionarioDocumentoItem) => {
                  const status = getStatusValidade(doc.data_validade);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{doc.nome}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 text-[11px]">{doc.tipo}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-[11px]">{doc.orgao_emissor || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] ${status.cor}`}>
                          {doc.data_validade ? new Date(doc.data_validade + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'} - {status.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={doc.drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold border border-emerald-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visualizar Arquivo
                          </a>
                          <button
                            type="button"
                            onClick={() => excluirDocumento(doc.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Excluir Documento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
