import React, { useState } from 'react';
import { Printer, Trash2, CheckCircle2, Eye, Camera } from 'lucide-react';
import type { ValeColaboradorItem } from '../../../../types/valeRh.types';
import { gerarReciboValeRhPDF } from '../../../../utils/reciboValeRhPdf';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { comprimirImagem, salvarComprovante } from '../../../../services/comprovanteStorageService';
import { anexarComprovanteVale } from '../../../../services/valeRhService';

interface Props {
  vales: ValeColaboradorItem[];
  onExcluir?: (id: string) => void;
  onReload?: () => void;
}

export const ValesTable: React.FC<Props> = ({ vales, onExcluir, onReload }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleAnexarComprovante = async (valeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingId(valeId);
      let urlFinal = '';
      const upDrive = await uploadParaGoogleDrive(file, 'rh');
      if (upDrive.sucesso && upDrive.driveUrl) {
        urlFinal = upDrive.driveUrl;
      } else {
        const chave = `idb://vale_${valeId}_${Date.now()}`;
        const b64 = await comprimirImagem(file);
        await salvarComprovante(chave, b64);
        urlFinal = chave;
      }
      const ok = await anexarComprovanteVale(valeId, urlFinal);
      if (ok) onReload?.();
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  if (vales.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-gray-100">
        Nenhum vale ou adiantamento registrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-2.5 px-3">Data</th>
            <th className="py-2.5 px-3">Colaborador</th>
            <th className="py-2.5 px-3 text-right">Valor</th>
            <th className="py-2.5 px-3">Forma</th>
            <th className="py-2.5 px-3">Caixa / Banco</th>
            <th className="py-2.5 px-3">Motivo / Obs</th>
            <th className="py-2.5 px-3 text-center">Status</th>
            <th className="py-2.5 px-3 text-center">Comprovante & Recibo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vales.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">{v.data}</td>
              <td className="py-2.5 px-3 font-bold text-gray-900">{v.colaboradorNome}</td>
              <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-right whitespace-nowrap">
                R$ {v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-3">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-800">
                  {v.formaPagamento}
                </span>
              </td>
              <td className="py-2.5 px-3 text-gray-600 truncate max-w-[140px]">{v.contaBancariaNome}</td>
              <td className="py-2.5 px-3 text-gray-600 truncate max-w-[200px]" title={v.observacao}>{v.observacao || '-'}</td>
              <td className="py-2.5 px-3 text-center">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  v.status === 'PAGO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <CheckCircle2 className="w-3 h-3" /> {v.status}
                </span>
              </td>
              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1.5">
                  {v.comprovanteUrl && (
                    <button
                      type="button"
                      onClick={() => abrirVisualizacaoImagem(v.comprovanteUrl, `Comprovante Vale - ${v.colaboradorNome}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 cursor-pointer"
                      title="Visualizar Comprovante Anexado"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Comprovante</span>
                    </button>
                  )}
                  <label
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg text-[10px] font-semibold border border-gray-200 cursor-pointer"
                    title={v.comprovanteUrl ? 'Trocar Comprovante' : 'Anexar Comprovante (Foto ou PDF)'}
                  >
                    <Camera className="w-3 h-3 text-emerald-600" />
                    <span>{uploadingId === v.id ? '...' : v.comprovanteUrl ? 'Trocar' : 'Anexar'}</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleAnexarComprovante(v.id, e)} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => gerarReciboValeRhPDF({
                      colaboradorNome: v.colaboradorNome, valorVale: v.valor,
                      dataVale: v.data, formaPagamento: v.formaPagamento, motivo: v.observacao
                    })}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-semibold border border-amber-200 cursor-pointer"
                    title="Imprimir Recibo de Vale em PDF"
                  >
                    <Printer className="w-3 h-3 text-amber-700" />
                    <span>Recibo</span>
                  </button>
                  {onExcluir && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Excluir o vale de R$ ${v.valor.toFixed(2)} para ${v.colaboradorNome}?`)) onExcluir(v.id);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Excluir Vale"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
