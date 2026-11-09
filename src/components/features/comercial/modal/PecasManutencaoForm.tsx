import React, { useState } from 'react';
import { Plus, Camera, X, ExternalLink, FileText } from 'lucide-react';
import { EmprestimoFieldsBox } from '../../../common/EmprestimoFieldsBox';
import { formatarTagEmprestimo } from '../../../../utils/emprestimoHelper';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import type { DespesaItemServico } from '../../../../types/servicoHorimetro.types';

interface Props {
  dataPadrao?: string;
  onAdicionar: (item: Omit<DespesaItemServico, 'id'>) => Promise<void>;
  disabled?: boolean;
}

export const PecasManutencaoForm: React.FC<Props> = ({ dataPadrao, onAdicionar, disabled }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(dataPadrao || hoje);
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [statusPagamento, setStatusPagamento] = useState<'PAGO' | 'PENDENTE'>('PAGO');
  const [comprovanteUrl, setComprovanteUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [isEmp, setIsEmp] = useState(false);
  const [empCredor, setEmpCredor] = useState('');
  const [empDtPegou, setEmpDtPegou] = useState(hoje);
  const [empDtPagar, setEmpDtPagar] = useState(hoje);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) setComprovanteUrl(res.driveUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(valor);
    if (!v || v <= 0 || !descricao.trim()) return;
    let fornFinal = fornecedor.trim() || 'Auto Peças / Mecânica';
    if (isEmp && empCredor.trim()) {
      const tag = formatarTagEmprestimo({ credorNome: empCredor.trim(), dataEmprestimo: empDtPegou, dataPagamentoPrevista: empDtPagar });
      fornFinal = `${fornFinal} ${tag}`.trim();
    }
    await onAdicionar({
      categoria: 'PECAS_LUBRIFICANTES',
      data: data || hoje,
      descricao: descricao.trim(),
      fornecedor: fornFinal,
      valor: v,
      forma_pagamento: formaPagamento,
      status_pagamento: isEmp ? 'PENDENTE' : statusPagamento,
      comprovante_url: comprovanteUrl || undefined
    });
    setDescricao('');
    setValor('');
    setComprovanteUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border border-orange-200 rounded-xl space-y-2.5 text-xs text-left">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Data do Gasto *</label>
          <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full h-8 px-2 bg-orange-50/40 border border-orange-300 rounded-lg text-xs" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Peças / Lubrificantes / Serviço *</label>
          <input type="text" required placeholder="Ex: Óleo Hidráulico 68, Filtro, Buchas" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Valor (R$) *</label>
          <input type="number" step="0.01" min="0.01" required placeholder="0.00" value={valor} onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-orange-950" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Fornecedor / Auto Peças</label>
          <input type="text" placeholder="Ex: Distribuidora Triângulo / Mecânico" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">De onde foi pago?</label>
          <select value={formaPagamento} onChange={(e) => { setFormaPagamento(e.target.value); setIsEmp(e.target.value === 'EMPRESTIMO'); }} className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold">
            <option value="PIX">🏦 Conta Bancária / PIX</option>
            <option value="DINHEIRO">💵 Dinheiro em Mãos (Caixa)</option>
            <option value="EMPRESTIMO">💸 Empréstimo</option>
            <option value="CARTAO">💳 Cartão</option>
            <option value="BOLETO">📄 Boleto / Faturado</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Status no Financeiro</label>
          <select value={isEmp ? 'PENDENTE' : statusPagamento} disabled={isEmp} onChange={(e) => setStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')} className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold">
            <option value="PAGO">Liquidado / Já Pago</option>
            <option value="PENDENTE">Pendente a Pagar</option>
          </select>
        </div>
      </div>

      {isEmp && (
        <EmprestimoFieldsBox compact credorNome={empCredor} setCredorNome={setEmpCredor} dataEmprestimo={empDtPegou} setDataEmprestimo={setEmpDtPegou} dataPagamentoPrevista={empDtPagar} setDataPagamentoPrevista={setEmpDtPagar} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-orange-100">
        <div className="flex items-center gap-2">
          {comprovanteUrl ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] text-emerald-800 font-medium">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Comprovante anexado</span>
              <button type="button" onClick={() => abrirVisualizacaoImagem(comprovanteUrl, 'Comprovante')} className="text-emerald-700 hover:underline"><ExternalLink className="w-3 h-3 inline ml-1" /></button>
              <button type="button" onClick={() => setComprovanteUrl('')} className="text-rose-500 hover:bg-rose-100 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <label className="flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-orange-300 hover:border-orange-500 bg-white rounded-lg cursor-pointer text-[11px] text-orange-800 font-semibold transition-all">
              <Camera className="w-3.5 h-3.5 text-orange-600" />
              <span>{uploading ? 'Enviando...' : 'Anexar Comprovante / Cupom (Drive)'}</span>
              <input type="file" accept="image/*,application/pdf" disabled={uploading} className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>
        <button type="submit" disabled={disabled || !valor || !descricao.trim()} className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Despesa</span>
        </button>
      </div>
    </form>
  );
};
