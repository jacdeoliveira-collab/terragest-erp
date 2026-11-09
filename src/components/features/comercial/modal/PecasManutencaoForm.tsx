import React, { useState, useEffect } from 'react';
import { Plus, Check, Camera, X, ExternalLink, FileText, RotateCcw } from 'lucide-react';
import { EmprestimoFieldsBox } from '../../../common/EmprestimoFieldsBox';
import { formatarTagEmprestimo, extrairInfoEmprestimo, removerTagEmprestimo } from '../../../../utils/emprestimoHelper';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { comprimirImagem, salvarComprovante } from '../../../../services/comprovanteStorageService';
import type { DespesaItemServico } from '../../../../types/servicoHorimetro.types';

interface Props {
  dataPadrao?: string; onAdicionar: (item: Omit<DespesaItemServico, 'id'>) => Promise<void>;
  itemEmEdicao?: DespesaItemServico | null; onSalvarEdicao?: (id: string, item: Omit<DespesaItemServico, 'id'>) => Promise<void>;
  onCancelarEdicao?: () => void; disabled?: boolean;
}

export const PecasManutencaoForm: React.FC<Props> = ({
  dataPadrao, onAdicionar, itemEmEdicao, onSalvarEdicao, onCancelarEdicao, disabled
}) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(dataPadrao || hoje);
  const [descricao, setDescricao] = useState(''); const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState<number | ''>(''); const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [statusPagamento, setStatusPagamento] = useState<'PAGO' | 'PENDENTE'>('PAGO');
  const [comprovanteUrl, setComprovanteUrl] = useState<string>(''); const [uploading, setUploading] = useState(false);
  const [isEmp, setIsEmp] = useState(false); const [empCredor, setEmpCredor] = useState('');
  const [empDtPegou, setEmpDtPegou] = useState(hoje); const [empDtPagar, setEmpDtPagar] = useState(hoje);

  useEffect(() => {
    if (itemEmEdicao) {
      setData(itemEmEdicao.data || dataPadrao || hoje);
      setDescricao(itemEmEdicao.descricao || '');
      setFornecedor(removerTagEmprestimo(itemEmEdicao.fornecedor) || '');
      setValor(itemEmEdicao.valor || '');
      setFormaPagamento(itemEmEdicao.forma_pagamento || 'PIX');
      setStatusPagamento(itemEmEdicao.status_pagamento || 'PAGO');
      setComprovanteUrl(itemEmEdicao.comprovante_url || '');
      const emp = extrairInfoEmprestimo({ observacoes: itemEmEdicao.fornecedor, forma_pagamento: itemEmEdicao.forma_pagamento });
      setIsEmp(emp.isEmprestimo);
      if (emp.isEmprestimo) {
        setEmpCredor(emp.credorNome || ''); setEmpDtPegou(emp.dataEmprestimo || hoje); setEmpDtPagar(emp.dataPagamentoPrevista || hoje);
      }
    } else {
      setDescricao(''); setValor(''); setComprovanteUrl(''); setIsEmp(false);
    }
  }, [itemEmEdicao]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const b64 = await comprimirImagem(file, 1200, 0.7);
      const chave = `idb://manut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await salvarComprovante(chave, b64);
      setComprovanteUrl(chave);
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) setComprovanteUrl(res.driveUrl);
    } catch {
    } finally { setUploading(false); }
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
    const payload = {
      categoria: 'PECAS_LUBRIFICANTES' as const, data: data || hoje, descricao: descricao.trim(),
      fornecedor: fornFinal, valor: v, forma_pagamento: formaPagamento,
      status_pagamento: isEmp ? 'PENDENTE' as const : statusPagamento, comprovante_url: comprovanteUrl || undefined
    };
    if (itemEmEdicao && onSalvarEdicao) await onSalvarEdicao(itemEmEdicao.id, payload);
    else await onAdicionar(payload);
    setDescricao(''); setValor(''); setComprovanteUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className={`p-3 border rounded-xl space-y-2.5 text-xs text-left transition-colors ${itemEmEdicao ? 'bg-amber-50/70 border-amber-400' : 'bg-white border-orange-200'}`}>
      {itemEmEdicao && (
        <div className="flex items-center justify-between pb-1 border-b border-amber-200 text-amber-900 font-bold">
          <span>✏️ Editando Despesa: {itemEmEdicao.descricao}</span>
          <button type="button" onClick={onCancelarEdicao} className="text-gray-500 hover:text-gray-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"><RotateCcw className="w-3 h-3" /> Cancelar Edição</button>
        </div>
      )}
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
          <input type="text" placeholder="Ex: Distribuidora / Mecânico" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">De onde foi pago?</label>
          <select value={formaPagamento} onChange={(e) => { setFormaPagamento(e.target.value); setIsEmp(e.target.value === 'EMPRESTIMO'); }} className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold">
            <option value="PIX">🏦 Conta Bancária / PIX</option><option value="DINHEIRO">💵 Dinheiro (Caixa)</option><option value="EMPRESTIMO">💸 Empréstimo</option><option value="CARTAO">💳 Cartão</option><option value="BOLETO">📄 Boleto</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Status no Financeiro</label>
          <select value={isEmp ? 'PENDENTE' : statusPagamento} disabled={isEmp} onChange={(e) => setStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')} className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold">
            <option value="PAGO">Liquidado / Já Pago</option><option value="PENDENTE">Pendente a Pagar</option>
          </select>
        </div>
      </div>
      {isEmp && (<EmprestimoFieldsBox compact credorNome={empCredor} setCredorNome={setEmpCredor} dataEmprestimo={empDtPegou} setDataEmprestimo={setEmpDtPegou} dataPagamentoPrevista={empDtPagar} setDataPagamentoPrevista={setEmpDtPagar} />)}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-orange-100">
        <div className="flex items-center gap-2">
          {comprovanteUrl ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] text-emerald-800 font-medium">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /><span>Comprovante anexado ✓</span>
              <button type="button" onClick={() => abrirVisualizacaoImagem(comprovanteUrl, 'Comprovante')} className="text-emerald-700 hover:underline"><ExternalLink className="w-3 h-3 inline ml-1" /></button>
              <button type="button" onClick={() => setComprovanteUrl('')} className="text-rose-500 hover:bg-rose-100 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <label className="flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-orange-300 hover:border-orange-500 bg-white rounded-lg cursor-pointer text-[11px] text-orange-800 font-semibold transition-all">
              <Camera className="w-3.5 h-3.5 text-orange-600" /><span>{uploading ? 'Enviando comprovante...' : 'Anexar Comprovante (Drive)'}</span>
              <input type="file" accept="image/*,application/pdf" disabled={uploading} className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          {itemEmEdicao && (<button type="button" onClick={onCancelarEdicao} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-pointer">Cancelar</button>)}
          <button type="submit" disabled={disabled || !valor || !descricao.trim()} className={`px-3.5 py-1.5 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ${itemEmEdicao ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
            {itemEmEdicao ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}<span>{itemEmEdicao ? 'Salvar Alterações' : 'Adicionar Despesa'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
