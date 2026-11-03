import React, { useEffect } from 'react';
import { Camera, Upload, Building, Wrench, Calendar, Store, Landmark } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { useFormaContaSync } from '../../../../hooks/useFormaContaSync';
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
  obraId: string; setObraId: (val: string) => void;
  servicoId: string; setServicoId: (val: string) => void;
  obras: Obra[]; servicos: ServicoHorimetro[];
  fotoCupomUrl?: string; onUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => void; uploadingFoto: boolean;
}

export const CupomDadosGeraisSection: React.FC<CupomDadosGeraisSectionProps> = ({
  data, setData, postoFornecedor, setPostoFornecedor, formaPagamento, setFormaPagamento,
  statusPagamento, setStatusPagamento, contaSaida, setContaSaida, contaBancariaId, setContaBancariaId,
  obraId, setObraId, servicoId, setServicoId, obras, servicos, fotoCupomUrl, onUploadFoto, uploadingFoto
}) => {
  const handleSelectConta = (id: string) => {
    if (setContaBancariaId) setContaBancariaId(id);
    const c = contas.find((item) => item.id === id);
    setContaSaida(c ? `${c.nome_conta} (${c.banco})` : 'Caixa da Obra');
  };
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaBancariaId || '', setFormaPagamento, handleSelectConta);

  useEffect(() => {
    if (contaPadrao && !contaBancariaId) {
      if (setContaBancariaId) setContaBancariaId(contaPadrao.id);
      setContaSaida(`${contaPadrao.nome_conta} (${contaPadrao.banco})`);
    } else if (!contaSaida) {
      setContaSaida('Caixa da Empresa');
    }
  }, [contaPadrao, contaBancariaId, contaSaida, setContaBancariaId, setContaSaida]);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>1. Dados do Cupom & Banco de Saída</span>
        </h4>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 shadow-2xs transition-all">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{uploadingFoto ? 'Processando...' : fotoCupomUrl ? 'Trocar Comprovante' : 'Foto ou PDF do Cupom'}</span>
          <input type="file" accept="image/*,application/pdf" onChange={onUploadFoto} className="hidden" />
        </label>
      </div>

      {fotoCupomUrl && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800">
          <div className="flex items-center gap-2 truncate">
            <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium truncate">Comprovante fiscal anexado com sucesso</span>
          </div>
          <button type="button" onClick={() => abrirVisualizacaoImagem(fotoCupomUrl, 'Comprovante / Cupom Fiscal')} className="text-emerald-700 font-bold hover:underline shrink-0 ml-2 cursor-pointer">
            Ver Arquivo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Data do Abastecimento *
          </label>
          <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-gray-400" /> Posto de Combustível *
          </label>
          <input required placeholder="Ex: Auto Posto Alvorada" value={postoFornecedor} onChange={(e) => setPostoFornecedor(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Banco / Conta de Saída *
          </label>
          <select value={contaBancariaId || ''} onChange={(e) => onContaChange(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900">
            {contas.map((c) => (<option key={c.id} value={c.id}>{c.nome_conta} {c.is_padrao ? '(Padrão)' : ''}</option>))}
            <option value="">Caixa da Obra / Espécie</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Forma de Pagamento *</label>
          <select value={formaPagamento} onChange={(e) => onFormaChange(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium">
            <option value="PIX">PIX (Transferência Instantânea)</option>
            <option value="CARTAO">Cartão de Débito / Crédito</option>
            <option value="DINHEIRO">Dinheiro em Espécie (Caixa)</option>
            <option value="BOLETO">Boleto / A Prazo (Faturado)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status no Contas a Pagar *</label>
          <select value={statusPagamento} onChange={(e) => setStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900">
            <option value="PAGO">Liquidado (Já foi pago na hora)</option>
            <option value="PENDENTE">Pendente a Pagar (Em aberto)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-600" /> Centro de Custo / Obra
          </label>
          <select value={obraId} onChange={(e) => setObraId(e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900">
            <option value="">Geral / Empresa (Sem obra específica)</option>
            {obras.map((o) => (<option key={o.id} value={o.id}>{o.nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-amber-600" /> Vincular a Serviço (Locação / Horímetro)
          </label>
          <select
            value={servicoId}
            onChange={(e) => {
              setServicoId(e.target.value);
              const s = servicos.find((srv) => srv.id === e.target.value);
              if (s?.obra_id && !obraId) setObraId(s.obra_id);
            }}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium"
          >
            <option value="">Nenhum (Apenas Frota / Custo Operacional)</option>
            {servicos.map((s) => (<option key={s.id} value={s.id}>{s.cliente_nome} — {s.maquina_nome}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
};
