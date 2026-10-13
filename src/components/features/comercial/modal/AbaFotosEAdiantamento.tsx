import React from 'react';
import { AdiantamentosHistoricoSection } from './AdiantamentosHistoricoSection';
import { OrcamentoCondicoesPagamentoSection } from '../OrcamentoCondicoesPagamentoSection';
import { ParcelasAgendadasSection } from './ParcelasAgendadasSection';
import type { AdiantamentoItem, ParcelaItem } from '../../../../types/servicoHorimetro.types';

interface PagamentoProps {
  formaPagamento: string; setFormaPagamento: (v: string) => void;
  condicaoPagamento: string; setCondicaoPagamento: (v: string) => void;
  contaBancariaId: string; setContaBancariaId: (v: string) => void;
  prazoDescricao: string; setPrazoDescricao: (v: string) => void;
  dataVencimento?: string; setDataVencimento?: (v: string) => void;
  parcelas?: ParcelaItem[];
  gerarParcelas?: (qtd: number, saldo: number) => void;
  atualizarParcela?: (id: string, updates: Partial<ParcelaItem>) => void;
  adicionarParcela?: (saldoSugerido?: number) => void;
  removerParcela?: (id: string) => void;
}

interface AbaFotosEAdiantamentoProps {
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoServico: string;
  faturamentoBruto: number;
  adiantamentosHistorico: AdiantamentoItem[];
  onAdicionarAdiantamento: (item: Omit<AdiantamentoItem, 'id'>) => void;
  onRemoverAdiantamento: (id: string) => void;
  onSalvarSinal?: () => Promise<boolean>;
  pagamento: PagamentoProps;
}

export const AbaFotosEAdiantamento: React.FC<AbaFotosEAdiantamentoProps> = ({
  clienteNome, clienteDocumento, clienteTelefone, descricaoServico,
  faturamentoBruto, adiantamentosHistorico, onAdicionarAdiantamento,
  onRemoverAdiantamento, onSalvarSinal, pagamento
}) => {
  const totalRecebido = Number(adiantamentosHistorico.reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2));
  const saldoRestante = Number(Math.max(0, faturamentoBruto - totalRecebido).toFixed(2));

  return (
    <div className="space-y-4 text-left text-xs">
      <OrcamentoCondicoesPagamentoSection
        formaPagamento={pagamento.formaPagamento} setFormaPagamento={pagamento.setFormaPagamento}
        condicaoPagamento={pagamento.condicaoPagamento} setCondicaoPagamento={pagamento.setCondicaoPagamento}
        contaBancariaId={pagamento.contaBancariaId} setContaBancariaId={pagamento.setContaBancariaId}
        prazoDescricao={pagamento.prazoDescricao} setPrazoDescricao={pagamento.setPrazoDescricao}
        dataVencimento={pagamento.dataVencimento} setDataVencimento={pagamento.setDataVencimento}
      />

      <AdiantamentosHistoricoSection
        clienteNome={clienteNome} clienteDocumento={clienteDocumento} clienteTelefone={clienteTelefone}
        descricaoServico={descricaoServico} faturamentoBruto={faturamentoBruto}
        adiantamentos={adiantamentosHistorico} onAdicionar={onAdicionarAdiantamento}
        onRemover={onRemoverAdiantamento} onSalvarSinal={onSalvarSinal}
      />

      <ParcelasAgendadasSection
        saldoRestante={saldoRestante}
        parcelas={pagamento.parcelas || []}
        onGerarParcelas={(qtd, saldo) => pagamento.gerarParcelas && pagamento.gerarParcelas(qtd, saldo)}
        onAtualizarParcela={(id, upd) => pagamento.atualizarParcela && pagamento.atualizarParcela(id, upd)}
        onAdicionarParcela={(sug) => pagamento.adicionarParcela && pagamento.adicionarParcela(sug)}
        onRemoverParcela={(id) => pagamento.removerParcela && pagamento.removerParcela(id)}
        onSalvarParcelas={onSalvarSinal}
      />
    </div>
  );
};
