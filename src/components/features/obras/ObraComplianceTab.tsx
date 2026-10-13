import React from 'react';
import { ExternalLink, Trash2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { useObraDocumentos } from '../../../hooks/useObraDocumentos';
import { ObraDocumentoForm } from './ObraDocumentoForm';
import type { ObraDocumentoItem } from '../../../types/obras.types';

interface ObraComplianceTabProps {
  obraId?: string;
}

export const ObraComplianceTab: React.FC<ObraComplianceTabProps> = ({ obraId }) => {
  const { documentos, isLoading, error, adicionarDocumento, excluirDocumento } = useObraDocumentos(obraId);

  if (!obraId) {
    return (
      <div className="p-8 text-center bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl my-2 text-xs">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h4 className="font-bold text-gray-800 uppercase tracking-wide">Compliance & Anexos</h4>
        <p className="text-gray-600 mt-1 font-semibold">Salve a obra para gerenciar licenças e anexos do Google Drive</p>
        <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm mx-auto">
          O repositório de licenças ambientais, ARTs e laudos técnicos fica habilitado após a gravação inicial da obra.
        </p>
      </div>
    );
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const data30d = new Date();
  data30d.setDate(data30d.getDate() + 30);
  const limite30d = data30d.toISOString().slice(0, 10);

  return (
    <div className="space-y-4 text-left text-xs">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário de Anexo */}
      <ObraDocumentoForm onAdicionar={adicionarDocumento} />

      {/* Lista de Documentos */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Acervo Digital da Obra ({documentos.length})
          </span>
          <span className="text-[11px] text-gray-400">Links sincronizados com Google Drive</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando acervo de compliance...</div>
        ) : documentos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
            <p>Nenhuma licença ou documento anexado a esta obra.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-2 px-3">Documento / Licença</th>
                  <th className="py-2 px-3">Tipo & Órgão</th>
                  <th className="py-2 px-3">Validade</th>
                  <th className="py-2 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {documentos.map((doc: ObraDocumentoItem) => {
                  const isVencido = doc.data_validade && doc.data_validade < hoje;
                  const isVencendo = doc.data_validade && !isVencido && doc.data_validade <= limite30d;

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-gray-900">{doc.nome}</div>
                        {doc.observacoes && <div className="text-[10px] text-gray-400 truncate max-w-xs">{doc.observacoes}</div>}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {doc.tipo.replace('_', ' ')}
                        </span>
                        {doc.orgao_emissor && <div className="text-[10px] text-gray-500 mt-0.5">{doc.orgao_emissor}</div>}
                      </td>
                      <td className="py-2 px-3 font-mono">
                        {doc.data_validade ? (
                          <div className={isVencido ? 'text-rose-600 font-bold' : isVencendo ? 'text-amber-600 font-bold' : 'text-gray-700'}>
                            {new Date(doc.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}
                            {isVencido && <span className="text-[9px] block text-rose-600">VENCIDO</span>}
                            {isVencendo && <span className="text-[9px] block text-amber-600">VENCE EM BREVE</span>}
                          </div>
                        ) : <span className="text-gray-400">Indeterminada</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={doc.drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-emerald-600" />
                            <span>Visualizar Arquivo</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => excluirDocumento(doc.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                            title="Remover documento"
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
