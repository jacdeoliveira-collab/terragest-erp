import React, { useState } from 'react';
import { Building2, Tag, Camera, CheckCircle2, Eye, Trash2, Loader2, Landmark } from 'lucide-react';
import { uploadParaGoogleDrive } from '../../../services/driveService';
import { abrirVisualizacaoImagem } from '../../../utils/visualizadorImagem';
import { useFormaContaSync } from '../../../hooks/useFormaContaSync';
import { EmprestimoFieldsBox } from '../../common/EmprestimoFieldsBox';
import { extrairInfoEmprestimo, formatarTagEmprestimo } from '../../../utils/emprestimoHelper';
import type { CategoriaCusto } from '../../../types/manutencao.types';
import type { Obra } from '../../../types/obras.types';

export interface ManutencaoCustosTabProps {
  obraId: string; setObraId: (val: string) => void;
  categoriaCustoId: string; setCategoriaCustoId: (val: string) => void;
  valorPecas: number; setValorPecas: (val: number) => void;
  valorMaoObra: number; setValorMaoObra: (val: number) => void;
  comprovanteUrl: string; setComprovanteUrl: (val: string) => void;
  contaBancariaId: string; setContaBancariaId: (val: string) => void;
  formaPagamento: string; setFormaPagamento: (val: string) => void;
  statusPagamentoOs: 'PAGO' | 'PENDENTE'; setStatusPagamentoOs: (val: 'PAGO' | 'PENDENTE') => void;
  obras: Obra[]; loadingObras: boolean;
  categorias: CategoriaCusto[]; loadingCategorias: boolean;
}

export const ManutencaoCustosTab: React.FC<ManutencaoCustosTabProps> = ({
  obraId, setObraId, categoriaCustoId, setCategoriaCustoId,
  valorPecas, setValorPecas, valorMaoObra, setValorMaoObra,
  comprovanteUrl, setComprovanteUrl, contaBancariaId, setContaBancariaId,
  formaPagamento, setFormaPagamento, statusPagamentoOs, setStatusPagamentoOs,
  obras, loadingObras, categorias, loadingCategorias
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const isEmp = formaPagamento.startsWith('EMPRESTIMO') || contaBancariaId === 'EMPRESTIMO';
  const infoEmp = extrairInfoEmprestimo({ observacoes: formaPagamento, forma_pagamento: isEmp ? 'EMPRESTIMO' : formaPagamento });
  const formaSimples = isEmp ? 'EMPRESTIMO' : formaPagamento;

  const atualizarEmp = (credor: string, dtPegou: string, dtPagar: string) => {
    const tag = formatarTagEmprestimo({ credorNome: credor, dataEmprestimo: dtPegou, dataPagamentoPrevista: dtPagar });
    setFormaPagamento(`EMPRESTIMO ${tag}`);
    setStatusPagamentoOs('PENDENTE');
  };

  const { contas, onFormaChange, onContaChange } = useFormaContaSync(
    contaBancariaId,
    (v: string) => v === 'EMPRESTIMO' ? atualizarEmp(infoEmp.credorNome === 'Credor / Terceiro' ? '' : infoEmp.credorNome, infoEmp.dataEmprestimo || hoje, infoEmp.dataPagamentoPrevista || hoje) : setFormaPagamento(v),
    setContaBancariaId
  );

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const total = (Number(valorPecas) || 0) + (Number(valorMaoObra) || 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError(null);
    try {
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) setComprovanteUrl(res.driveUrl);
      else setUploadError(res.erro || 'Não foi possível enviar o comprovante para o Google Drive.');
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar arquivo para o Drive.');
    } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" /><span>Centro de Custo / Obra *</span>
          </label>
          <select required value={obraId} onChange={(e) => setObraId(e.target.value)} disabled={loadingObras || obras.length === 0} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900">
            <option value="">{obras.length === 0 ? 'Nenhuma obra cadastrada' : 'Selecione o Canteiro / Obra'}</option>
            {obras.map((ob) => <option key={ob.id} value={ob.id}>{ob.nome} {ob.cliente ? `(${ob.cliente})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" /><span>Categoria de Custo Financeiro *</span>
          </label>
          <select required value={categoriaCustoId} onChange={(e) => setCategoriaCustoId(e.target.value)} disabled={loadingCategorias || categorias.length === 0} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900">
            <option value="">Selecione a categoria de manutenção</option>
            {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Valor de Peças, Óleo & Componentes (R$)</label>
          <input type="number" step="0.01" min="0" value={valorPecas || ''} onChange={(e) => setValorPecas(parseFloat(e.target.value) || 0)} placeholder="0,00" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Valor da Mão de Obra (R$)</label>
          <input type="number" step="0.01" min="0" value={valorMaoObra || ''} onChange={(e) => setValorMaoObra(parseFloat(e.target.value) || 0)} placeholder="0,00" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl">
        <div>
          <label className="block text-[11px] font-semibold text-emerald-900 mb-1 flex items-center gap-1">
            <Landmark className="w-3 h-3 text-emerald-700" /><span>De onde saiu o pagamento?</span>
          </label>
          <select value={contaBancariaId} onChange={(e) => onContaChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs">
            {contas.map((c) => <option key={c.id} value={c.id}>{c.nome_conta} ({c.banco})</option>)}
            <option value="">💵 Dinheiro em Mãos / Caixa</option>
            <option value="EMPRESTIMO">💸 Empréstimo (Pegou Emprestado)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Forma Pagamento</label>
          <select value={formaSimples} onChange={(e) => onFormaChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs">
            <option value="PIX">PIX Bancário</option><option value="DINHEIRO">Dinheiro em Mãos</option><option value="EMPRESTIMO">💸 Empréstimo (Terceiro)</option><option value="BOLETO">Boleto</option><option value="CARTAO">Cartão</option><option value="TRANSFERENCIA">Transferência</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Status Financeiro</label>
          <select value={isEmp ? 'PENDENTE' : statusPagamentoOs} disabled={isEmp} onChange={(e) => setStatusPagamentoOs(e.target.value as 'PAGO' | 'PENDENTE')} className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold">
            <option value="PAGO">Pago (Dar Baixa)</option><option value="PENDENTE">A Pagar (Pendente)</option>
          </select>
        </div>
      </div>

      {isEmp && (
        <EmprestimoFieldsBox compact credorNome={infoEmp.credorNome === 'Credor / Terceiro' ? '' : infoEmp.credorNome} setCredorNome={(c) => atualizarEmp(c, infoEmp.dataEmprestimo || hoje, infoEmp.dataPagamentoPrevista || hoje)} dataEmprestimo={infoEmp.dataEmprestimo || hoje} setDataEmprestimo={(dt) => atualizarEmp(infoEmp.credorNome, dt, infoEmp.dataPagamentoPrevista || hoje)} dataPagamentoPrevista={infoEmp.dataPagamentoPrevista || hoje} setDataPagamentoPrevista={(dt) => atualizarEmp(infoEmp.credorNome, infoEmp.dataEmprestimo || hoje, dt)} />
      )}

      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-800">Nota Fiscal / Comprovante ({total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</p>
          {uploadError && <p className="text-[10px] text-rose-600">{uploadError}</p>}
          {comprovanteUrl && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Anexado</span>
              <button type="button" onClick={() => abrirVisualizacaoImagem(comprovanteUrl, 'Comprovante OS')} className="text-[10px] text-emerald-700 font-bold underline cursor-pointer"><Eye className="w-3 h-3 inline" /> Ver</button>
              <button type="button" onClick={() => setComprovanteUrl('')} className="text-rose-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-semibold cursor-pointer shrink-0">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{uploading ? 'Enviando...' : comprovanteUrl ? 'Trocar' : 'Anexar Foto'}</span>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
    </div>
  );
};
