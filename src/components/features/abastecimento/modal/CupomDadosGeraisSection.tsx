import React, { useEffect } from 'react';
import { Camera, Upload, Building, Wrench, Calendar, Store, Landmark } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { useFormaContaSync } from '../../../../hooks/useFormaContaSync';
import { EmprestimoFieldsBox } from '../../../common/EmprestimoFieldsBox';
import type { FormaPagamentoDespesa } from '../../../../types/contasPagar.types';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import type { Obra } from '../../../../types/obra.types';

interface CupomDadosGeraisSectionProps {
  data: string; setData: (val: string) => void;
  postoFornecedor: string; setPostoFornecedor: (val: string) => void;
  formaPagamento: FormaPagamentoDespesa; setFormaPagamento: (val: FormaPagamentoDespesa) => void;
  statusPagamento: 'PAGO' | 'PENDENTE'; setStatusPagamento: (val: 'PAGO' | 'PENDENTE') => void;
  contaSaida: string; setContaSaida: (val: string) => void;
  contaBancariaId?: string; setContaBancariaId?: (val: string) => void;
  credorEmprestimo: string; setCredorEmprestimo: (val: string) => void;
  dataEmprestimo: string; setDataEmprestimo: (val: string) => void;
  dataPagarEmprestimo: string; setDataPagarEmprestimo: (val: string) => void;
  obraId: string; setObraId: (val: string) => void;
  servicoId: string; setServicoId: (val: string) => void;
  obras: Obra[]; servicos: ServicoHorimetro[];
  fotoCupomUrl?: string; onUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => void; uploadingFoto: boolean;
}

export const CupomDadosGeraisSection: React.FC<CupomDadosGeraisSectionProps> = ({
  data, setData, postoFornecedor, setPostoFornecedor, formaPagamento, setFormaPagamento,
  statusPagamento, setStatusPagamento, contaSaida, setContaSaida, contaBancariaId, setContaBancariaId,
  credorEmprestimo, setCredorEmprestimo, dataEmprestimo, setDataEmprestimo, dataPagarEmprestimo, setDataPagarEmprestimo,
  obraId, setObraId, servicoId, setServicoId, obras, servicos, fotoCupomUrl, onUploadFoto, uploadingFoto
}) => {
  const handleSelectConta = (id: string) => {
    if (setContaBancariaId) setContaBancariaId(id);
    if (id === 'EMPRESTIMO') { setContaSaida('Empréstimo de Terceiro'); return; }
    const c = contas.find((item) => item.id === id);
    setContaSaida(c ? `${c.nome_conta} (${c.banco})` : 'Caixa em Mãos');
  };
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaBancariaId || '', setFormaPagamento, handleSelectConta);

  useEffect(() => {
    if (contaPadrao && !contaBancariaId && formaPagamento !== 'EMPRESTIMO') {
      if (setContaBancariaId) setContaBancariaId(contaPadrao.id);
      setContaSaida(`${contaPadrao.nome_conta} (${contaPadrao.banco})`);
    } else if (!contaSaida) {
      setContaSaida('Caixa da Empresa');
    }
  }, [contaPadrao, contaBancariaId, contaSaida, formaPagamento, setContaBancariaId, setContaSaida]);

  const isEmprestimo = formaPagamento === 'EMPRESTIMO' || contaBancariaId === 'EMPRESTIMO';

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>1. Dados do Cupom & Origem do Pagamento</span>
        </h4>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 shadow-2xs transition-all">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{uploadingFoto ? 'Processando...' : fotoCupomUrl ? 'Trocar Comprovante' : 'Foto ou PDF do Cupom'}</span>
          <input type="file" accept="image/*,application/pdf" onChange={onUploadFoto} className="hidden" />
        </label>
      </div>

      {fotoCupomUrl && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800">
          <div className="flex items-center gap-2 truncate"><Upload className="w-4 h-4 text-emerald-600 shrink-0" /><span className="font-medium truncate">Comprovante fiscal anexado com sucesso</span></div>
          <button type="button" onClick={() => abrirVisualizacaoImagem(fotoCupomUrl, 'Comprovante / Cupom Fiscal')} className="text-emerald-700 font-bold hover:underline shrink-0 ml-2 cursor-pointer">Ver Arquivo</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Data do Abastecimento *</label>
          <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1"><Store className="w-3.5 h-3.5 text-gray-400" /> Posto de Combustível *</label>
          <input required placeholder="Ex: Auto Posto Alvorada" value={postoFornecedor} onChange={(e) => setPostoFornecedor(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> De onde saiu o pagamento? *</label>
          <select value={contaBancariaId || ''} onChange={(e) => onContaChange(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900">
            {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} {c.is_padrao ? '(Padrão)' : ''}</option>))}
            <option value="">💵 Dinheiro em Mãos / Caixa</option>
            <option value="EMPRESTIMO">💸 Empréstimo (Pegou Emprestado)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Forma de Pagamento *</label>
          <select value={formaPagamento} onChange={(e) => onFormaChange(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium">
            <option value="PIX">PIX (Da Conta Bancária)</option>
            <option value="DINHEIRO">Dinheiro em Mãos (Caixa)</option>
            <option value="EMPRESTIMO">💸 Empréstimo (Pegou de Terceiro / Pagar Depois)</option>
            <option value="CARTAO">Cartão de Débito / Crédito</option>
            <option value="BOLETO">Boleto / A Prazo (Faturado)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status no Contas a Pagar *</label>
          <select value={isEmprestimo ? 'PENDENTE' : statusPagamento} disabled={isEmprestimo} onChange={(e) => setStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900">
            <option value="PAGO">Liquidado (Já foi pago na hora)</option>
            <option value="PENDENTE">Pendente a Pagar (Em aberto)</option>
          </select>
        </div>
      </div>

      {isEmprestimo && (
        <EmprestimoFieldsBox credorNome={credorEmprestimo} setCredorNome={setCredorEmprestimo} dataEmprestimo={dataEmprestimo} setDataEmprestimo={setDataEmprestimo} dataPagamentoPrevista={dataPagarEmprestimo} setDataPagamentoPrevista={setDataPagarEmprestimo} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1"><Building className="w-3.5 h-3.5 text-emerald-600" /> Centro de Custo / Obra</label>
          <select value={obraId} onChange={(e) => setObraId(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900">
            <option value="">Geral / Empresa (Sem obra específica)</option>
            {obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-amber-600" /> Vincular a Serviço (Locação / Horímetro)</label>
          <select value={servicoId} onChange={(e) => { setServicoId(e.target.value); const s = servicos.find((srv) => srv.id === e.target.value); if (s?.obra_id && !obraId) setObraId(s.obra_id); }} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium">
            <option value="">Nenhum (Apenas Frota / Custo Operacional)</option>
            {servicos.map((s) => (<option key={s.id} value={s.id}>{s.cliente_nome} — {s.maquina_nome}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
};
