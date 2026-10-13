import React, { useEffect } from 'react';
import { CreditCard, Landmark, Clock, Calendar } from 'lucide-react';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import { calcularCondicaoPagamento } from './condicoesPagamentoHelper';

interface Props {
  formaPagamento: string;
  setFormaPagamento: (v: string) => void;
  condicaoPagamento: string;
  setCondicaoPagamento: (v: string) => void;
  contaBancariaId: string;
  setContaBancariaId: (v: string) => void;
  prazoDescricao: string;
  setPrazoDescricao: (v: string) => void;
  dataVencimento?: string;
  setDataVencimento?: (v: string) => void;
}

export const OrcamentoCondicoesPagamentoSection: React.FC<Props> = ({
  formaPagamento, setFormaPagamento,
  condicaoPagamento, setCondicaoPagamento,
  contaBancariaId, setContaBancariaId,
  prazoDescricao, setPrazoDescricao,
  dataVencimento, setDataVencimento
}) => {
  const { contas, isLoading } = useContasBancarias();

  // Seleciona automaticamente a conta padrão se nenhuma tiver sido escolhida
  useEffect(() => {
    if (!contaBancariaId && contas.length > 0) {
      const padrao = contas.find((c) => c.is_padrao) || contas[0];
      if (padrao) setContaBancariaId(padrao.id);
    }
  }, [contas, contaBancariaId, setContaBancariaId]);

  const aplicarCondicao = (val: string) => {
    setCondicaoPagamento(val);
    const res = calcularCondicaoPagamento(val);
    if (val !== 'PERSONALIZADO') {
      setPrazoDescricao(res.prazoDescricao);
      if (setDataVencimento) setDataVencimento(res.dataVencimento);
    } else if (!dataVencimento && setDataVencimento) {
      setDataVencimento(res.dataVencimento);
    }
  };

  const contaSelecionada = contas.find((c) => c.id === contaBancariaId);

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 text-xs text-left">
      <span className="font-bold text-gray-900 flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
        Condições de Pagamento, Prazo e Chave PIX
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-600" /> Forma de Pagamento
          </label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium"
          >
            <option value="PIX">PIX Bancário</option>
            <option value="BOLETO">Boleto Bancário</option>
            <option value="TRANSFERENCIA">Transferência / TED</option>
            <option value="CARTAO">Cartão</option>
            <option value="DINHEIRO">Dinheiro / Espécie</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Prazo / Condição
          </label>
          <select
            value={condicaoPagamento}
            onChange={(e) => aplicarCondicao(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium"
          >
            <option value="A_VISTA">À Vista</option>
            <option value="15_DIAS">15 Dias após medição</option>
            <option value="30_DIAS">30 Dias após medição</option>
            <option value="SINAL_50_50">50% Sinal + 50% Conclusão</option>
            <option value="PARCELADO_2X">Parcelado 2x (30/60)</option>
            <option value="PERSONALIZADO">Personalizado</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-600" /> Data do Prazo / Vencimento
          </label>
          <input
            type="date"
            value={dataVencimento || ''}
            onChange={(e) => {
              if (setDataVencimento) setDataVencimento(e.target.value);
            }}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Landmark className="w-3 h-3 text-emerald-600" /> Conta / Chave Pix da Empresa
          </label>
          <select
            value={contaBancariaId}
            onChange={(e) => setContaBancariaId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium"
          >
            {isLoading && <option value="">Carregando contas...</option>}
            {(contas || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_conta} {c.is_padrao ? '(Padrão)' : ''} {c.chave_pix ? `[Pix: ${c.chave_pix}]` : ''}
              </option>
            ))}
            {(!contas || contas.length === 0) && <option value="">Nenhuma conta cadastrada</option>}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-600 mb-1 text-[11px]">
          Descrição do Prazo / Observação de Pagamento (impresso no PDF):
        </label>
        <input
          type="text"
          value={prazoDescricao}
          onChange={(e) => setPrazoDescricao(e.target.value)}
          placeholder="Ex: 50% de entrada no aceite e 50% na conclusão após apuração do BDE"
          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium"
        />
      </div>

      {contaSelecionada?.chave_pix && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-900">
          <span><b>Chave PIX da Proposta:</b> {contaSelecionada.chave_pix} ({contaSelecionada.tipo_chave_pix || 'PIX'})</span>
          <span className="text-[10px] text-emerald-700">{contaSelecionada.banco} • {contaSelecionada.titular || 'Favorecido'}</span>
        </div>
      )}
    </div>
  );
};
