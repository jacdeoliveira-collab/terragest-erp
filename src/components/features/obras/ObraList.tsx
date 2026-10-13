import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Plus, AlertCircle, Building2 } from 'lucide-react';
import { useObraContext } from '../../../contexts/ObraContext';
import { Modal } from '../../ui/Modal';
import { ObraForm } from './ObraForm';
import { ObraResumoModal } from './modal/ObraResumoModal';
import { gerarRelatorioObrasPDF, gerarExcelObras } from '../../../utils/exportObras';
import type { Obra, StatusObra } from '../../../types/obras.types';

function renderStatusBadge(status: StatusObra) {
  const map: Record<string, string> = {
    EM_ANDAMENTO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ATIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARALISADA: 'bg-amber-50 text-amber-700 border-amber-200',
    NAO_INICIADA: 'bg-blue-50 text-blue-700 border-blue-200',
    CONCLUIDA: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  const cls = map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>{status}</span>;
}

export const ObraList: React.FC = () => {
  const { obras, loading, error, recarregarObras } = useObraContext();
  const [obraResumo, setObraResumo] = useState<Obra | null>(null);
  const [obraEdit, setObraEdit] = useState<Obra | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleCreated = () => {
    setIsEditOpen(false);
    setObraEdit(null);
    recarregarObras();
  };

  if (loading) return <div className="p-12 text-center text-sm text-gray-400">Carregando canteiros de obras...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Centros de Custo & Canteiros de Obras</h2>
          <p className="text-xs text-gray-500">Clique na obra para ver o resumo operacional, financeiro e máquinas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => gerarRelatorioObrasPDF(obras)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer">
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>
          <button onClick={() => gerarExcelObras(obras)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button onClick={() => { setObraEdit(null); setIsEditOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Nova Obra</span>
          </button>
        </div>
      </div>

      {error && <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /><span>{error}</span></div>}

      {obras.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Nenhuma obra cadastrada nesta empresa.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Nome da Obra</th>
                <th className="p-3.5">Cliente / Contratante</th>
                <th className="p-3.5">Localização / Prazos</th>
                <th className="p-3.5">CNO / ART</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {obras.map((obra: Obra) => (
                <tr
                  key={obra.id}
                  onClick={() => setObraResumo(obra)}
                  className="hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  title="Clique para abrir o resumo financeiro e operacional"
                >
                  <td className="p-3.5 font-semibold text-gray-900 hover:text-emerald-700">{obra.nome}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{obra.cliente_nome || obra.cliente || 'Não informado'}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-500 truncate max-w-[200px]">{obra.endereco_completo || obra.localizacao || '-'}</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-600">{obra.cno || obra.art_crea || '-'}</td>
                  <td className="p-3.5 text-center">{renderStatusBadge(obra.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ObraResumoModal
        isOpen={Boolean(obraResumo)}
        onClose={() => setObraResumo(null)}
        obra={obraResumo}
        onEditar={(o) => { setObraEdit(o); setIsEditOpen(true); }}
      />

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setObraEdit(null); }} title={obraEdit ? `Editar Obra: ${obraEdit.nome}` : "Cadastrar Nova Obra"}>
        <ObraForm onSuccess={handleCreated} onCancel={() => { setIsEditOpen(false); setObraEdit(null); }} obraInicial={obraEdit} />
      </Modal>
    </div>
  );
};
