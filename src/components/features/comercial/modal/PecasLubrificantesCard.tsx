import React from 'react';
import { Wrench, Camera, X, FileText, ExternalLink } from 'lucide-react';

interface Props {
  valor: number;
  onChangeValor: (v: number) => void;
  descricao: string;
  onChangeDescricao: (v: string) => void;
  fornecedor: string;
  onChangeFornecedor: (v: string) => void;
  formaPagamento: string;
  onChangeFormaPagamento: (v: string) => void;
  statusPagamento: 'PAGO' | 'PENDENTE';
  onChangeStatusPagamento: (v: 'PAGO' | 'PENDENTE') => void;
  comprovanteUrl?: string;
  onUploadComprovante: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoverComprovante: () => void;
  uploading?: boolean;
}

export const PecasLubrificantesCard: React.FC<Props> = ({
  valor, onChangeValor, descricao, onChangeDescricao, fornecedor, onChangeFornecedor,
  formaPagamento, onChangeFormaPagamento, statusPagamento, onChangeStatusPagamento,
  comprovanteUrl, onUploadComprovante, onRemoverComprovante, uploading
}) => {
  return (
    <div className="p-3.5 bg-orange-50/60 border border-orange-200/90 rounded-2xl space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-orange-200/70 pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-600" />
          <span className="font-bold text-gray-900 text-xs">3. Peças, Lubrificantes & Manutenção</span>
        </div>
        <span className="text-[10px] font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-full font-mono">
          R$ {(Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Peças / Lubrificantes Utilizados
          </label>
          <input
            type="text"
            placeholder="Ex: Óleo Hidráulico 68, Filtro de Óleo, Graxa, Mangueira"
            value={descricao}
            onChange={(e) => onChangeDescricao(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Fornecedor / Auto Peças
          </label>
          <input
            type="text"
            placeholder="Ex: Distribuidora Triângulo / Casa das Mangueiras"
            value={fornecedor}
            onChange={(e) => onChangeFornecedor(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
            Valor Total das Peças (R$) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={valor || ''}
            onChange={(e) => onChangeValor(parseFloat(e.target.value) || 0)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-orange-950 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Forma de Pagamento</label>
          <select
            value={formaPagamento}
            onChange={(e) => onChangeFormaPagamento(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-orange-500"
          >
            <option value="PIX">PIX</option>
            <option value="CARTAO">Cartão Débito / Crédito</option>
            <option value="DINHEIRO">Dinheiro em Espécie</option>
            <option value="BOLETO">Boleto / Faturado</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status no Financeiro</label>
          <select
            value={statusPagamento}
            onChange={(e) => onChangeStatusPagamento(e.target.value as 'PAGO' | 'PENDENTE')}
            className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-orange-500"
          >
            <option value="PAGO">Liquidado / Já Pago</option>
            <option value="PENDENTE">Pendente a Pagar</option>
          </select>
        </div>
      </div>

      <div className="pt-1">
        {comprovanteUrl ? (
          <div className="flex items-center justify-between p-2.5 bg-white border border-orange-300 rounded-xl text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="font-semibold text-gray-800 truncate">Comprovante de Peças / Lubrificantes Anexado</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="text-orange-700 font-bold hover:underline flex items-center gap-1">
                <span>Ver Cupom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button type="button" onClick={onRemoverComprovante} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-orange-300 hover:border-orange-500 bg-white/80 hover:bg-orange-50/50 rounded-xl text-xs font-semibold text-orange-800 cursor-pointer transition-all">
            <Camera className="w-4 h-4 text-orange-600" />
            <span>{uploading ? 'Enviando comprovante...' : 'Anexar Nota Fiscal / Cupom de Peças & Lubrificantes'}</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onUploadComprovante} />
          </label>
        )}
      </div>
    </div>
  );
};
