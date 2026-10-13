import React from 'react';
import { Camera, Upload, Building, Wrench, Calendar, Store, CreditCard } from 'lucide-react';
import type { FormaPagamentoDespesa } from '../../../../types/contasPagar.types';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import type { Obra } from '../../../../types/obra.types';

interface CupomDadosGeraisSectionProps {
  data: string; setData: (val: string) => void;
  postoFornecedor: string; setPostoFornecedor: (val: string) => void;
  formaPagamento: FormaPagamentoDespesa; setFormaPagamento: (val: FormaPagamentoDespesa) => void;
  statusPagamento: 'PAGO' | 'PENDENTE'; setStatusPagamento: (val: 'PAGO' | 'PENDENTE') => void;
  contaSaida: string; setContaSaida: (val: string) => void;
  obraId: string; setObraId: (val: string) => void;
  servicoId: string; setServicoId: (val: string) => void;
  obras: Obra[]; servicos: ServicoHorimetro[];
  fotoCupomUrl?: string; onUploadFoto: (e: React.ChangeEvent<HTMLInputElement>) => void; uploadingFoto: boolean;
}

export const CupomDadosGeraisSection: React.FC<CupomDadosGeraisSectionProps> = ({
  data, setData, postoFornecedor, setPostoFornecedor, formaPagamento, setFormaPagamento,
  statusPagamento, setStatusPagamento, contaSaida, setContaSaida, obraId, setObraId,
  servicoId, setServicoId, obras, servicos, fotoCupomUrl, onUploadFoto, uploadingFoto
}) => {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>1. Dados do Cupom & Pagamento</span>
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
          <a href={fotoCupomUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline shrink-0 ml-2">
            Ver Arquivo
          </a>
        </div>
      )}

      {/* Linha 1: 3 colunas para dados primários */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Data do Abastecimento *
          </label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-gray-400" /> Posto de Combustível *
          </label>
          <input
            required
            placeholder="Ex: Auto Posto Alvorada"
            value={postoFornecedor}
            onChange={(e) => setPostoFornecedor(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" /> Conta de Saída (Origem) *
          </label>
          <input
            required
            placeholder="Ex: Caixa da Obra / Cartão / Cora"
            value={contaSaida}
            onChange={(e) => setContaSaida(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Linha 2: 2 colunas para forma de pagamento e status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Forma de Pagamento *</label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as FormaPagamentoDespesa)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
          >
            <option value="PIX">PIX (Transferência Instantânea)</option>
            <option value="CARTAO">Cartão de Débito / Crédito</option>
            <option value="DINHEIRO">Dinheiro em Espécie (Caixa)</option>
            <option value="BOLETO">Boleto / A Prazo (Faturado)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status no Contas a Pagar *</label>
          <select
            value={statusPagamento}
            onChange={(e) => setStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="PAGO">Liquidado (Já foi pago na hora)</option>
            <option value="PENDENTE">Pendente a Pagar (Em aberto)</option>
          </select>
        </div>
      </div>

      {/* Linha 3: 2 colunas espaçosas para Centro de Custo e Serviço */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-600" /> Centro de Custo / Obra
          </label>
          <select
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
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
            onChange={(e) => setServicoId(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Nenhum (Apenas Frota / Custo Operacional)</option>
            {servicos.map((s) => (<option key={s.id} value={s.id}>{s.cliente_nome} - {s.maquina_nome}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
};
