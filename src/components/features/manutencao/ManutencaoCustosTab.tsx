import React, { useState } from 'react';
import { DollarSign, Building2, Tag, Camera, CheckCircle2, Eye, Trash2, Loader2 } from 'lucide-react';
import { uploadParaGoogleDrive } from '../../../services/driveService';
import { abrirVisualizacaoImagem } from '../../../utils/visualizadorImagem';
import type { CategoriaCusto } from '../../../types/manutencao.types';
import type { Obra } from '../../../types/obras.types';

export interface ManutencaoCustosTabProps {
  obraId: string;
  setObraId: (val: string) => void;
  categoriaCustoId: string;
  setCategoriaCustoId: (val: string) => void;
  valorPecas: number;
  setValorPecas: (val: number) => void;
  valorMaoObra: number;
  setValorMaoObra: (val: number) => void;
  comprovanteUrl: string;
  setComprovanteUrl: (val: string) => void;
  obras: Obra[];
  loadingObras: boolean;
  categorias: CategoriaCusto[];
  loadingCategorias: boolean;
}

export const ManutencaoCustosTab: React.FC<ManutencaoCustosTabProps> = ({
  obraId, setObraId, categoriaCustoId, setCategoriaCustoId,
  valorPecas, setValorPecas, valorMaoObra, setValorMaoObra,
  comprovanteUrl, setComprovanteUrl, obras, loadingObras, categorias, loadingCategorias
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const total = (Number(valorPecas) || 0) + (Number(valorMaoObra) || 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) {
        setComprovanteUrl(res.driveUrl);
      } else {
        setUploadError(res.erro || 'Não foi possível enviar o comprovante para o Google Drive.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar arquivo para o Drive.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Centro de Custo / Obra *</span>
          </label>
          <select
            required value={obraId} onChange={(e) => setObraId(e.target.value)}
            disabled={loadingObras || obras.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{obras.length === 0 ? 'Nenhuma obra cadastrada' : 'Selecione o Canteiro / Obra'}</option>
            {obras.map((ob) => (
              <option key={ob.id} value={ob.id}>{ob.nome} {ob.cliente ? `(${ob.cliente})` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Categoria de Custo Financeiro *</span>
          </label>
          <select
            required value={categoriaCustoId} onChange={(e) => setCategoriaCustoId(e.target.value)}
            disabled={loadingCategorias || categorias.length === 0}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione a categoria de manutenção</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Valor de Peças & Componentes (R$)</label>
          <input
            type="number" step="0.01" min="0" value={valorPecas || ''}
            onChange={(e) => setValorPecas(parseFloat(e.target.value) || 0)} placeholder="0,00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Valor da Mão de Obra (R$)</label>
          <input
            type="number" step="0.01" min="0" value={valorMaoObra || ''}
            onChange={(e) => setValorMaoObra(parseFloat(e.target.value) || 0)} placeholder="0,00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-gray-800">Foto / Nota Fiscal / Comprovante da Despesa</p>
            <p className="text-[10px] text-gray-500">Salvo direto no Google Drive da Frota (Imagem ou PDF)</p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{uploading ? 'Enviando...' : comprovanteUrl ? 'Trocar Arquivo' : 'Adicionar Foto / Arquivo'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        {uploadError && <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>}

        {comprovanteUrl && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Comprovante sincronizado no Google Drive
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button type="button" onClick={() => abrirVisualizacaoImagem(comprovanteUrl, 'Comprovante OS Manutenção')} className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline cursor-pointer">
                <Eye className="w-3.5 h-3.5" /> Ver
              </button>
              <button type="button" onClick={() => setComprovanteUrl('')} className="text-rose-600 hover:text-rose-700 cursor-pointer" title="Remover anexo">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-900 uppercase">Custo Total da OS</p>
            <p className="text-[10px] text-emerald-700">Apropriado diretamente na obra selecionada</p>
          </div>
        </div>
        <span className="text-base font-bold font-mono text-emerald-800">
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
};
