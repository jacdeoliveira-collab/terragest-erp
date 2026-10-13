import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { AlmoxarifadoOcrUploadBanner } from './AlmoxarifadoOcrUploadBanner';
import { MovimentacaoFornecedorNfFields } from './MovimentacaoFornecedorNfFields';
import type { TipoMovimentacaoAlmoxarifado } from '../../../types/almoxarifado.types';

interface MovimentacaoDadosTabProps {
  tipoMovimentacao: TipoMovimentacaoAlmoxarifado;
  setTipoMovimentacao: (val: TipoMovimentacaoAlmoxarifado) => void;
  data: string;
  setData: (val: string) => void;
  fornecedorNome: string;
  setFornecedorNome: (val: string) => void;
  numeroNf: string;
  setNumeroNf: (val: string) => void;
  valorTotal?: number;
  setValorTotal?: (val: number) => void;
  gerarContaPagar?: boolean;
  setGerarContaPagar?: (val: boolean) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
  lendoOcr?: boolean;
  mensagemSucesso?: string | null;
  comprovanteUrl?: string;
  onUploadArquivo?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MovimentacaoDadosTab: React.FC<MovimentacaoDadosTabProps> = ({
  tipoMovimentacao, setTipoMovimentacao, data, setData,
  fornecedorNome, setFornecedorNome, numeroNf, setNumeroNf,
  valorTotal, setValorTotal, gerarContaPagar, setGerarContaPagar,
  observacoes, setObservacoes, lendoOcr, mensagemSucesso,
  comprovanteUrl, onUploadArquivo
}) => {
  return (
    <div className="space-y-3.5 text-left">
      {onUploadArquivo && (
        <AlmoxarifadoOcrUploadBanner
          lendoOcr={Boolean(lendoOcr)}
          mensagemSucesso={mensagemSucesso || null}
          comprovanteUrl={comprovanteUrl}
          onUploadArquivo={onUploadArquivo}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">Tipo de Movimentação *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoMovimentacao('ENTRADA')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                tipoMovimentacao === 'ENTRADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Entrada (Compra)</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoMovimentacao('SAIDA')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                tipoMovimentacao === 'SAIDA' ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Saída (Canteiro)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Data do Recebimento *</span>
          </label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <MovimentacaoFornecedorNfFields
        fornecedorNome={fornecedorNome} setFornecedorNome={setFornecedorNome}
        numeroNf={numeroNf} setNumeroNf={setNumeroNf}
        valorTotal={valorTotal} setValorTotal={setValorTotal}
        gerarContaPagar={gerarContaPagar} setGerarContaPagar={setGerarContaPagar}
        tipoMovimentacao={tipoMovimentacao}
      />

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Observações de Recebimento</label>
        <input
          placeholder="Ex: Peças para aplicar na Escavadeira E215C EVO..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
