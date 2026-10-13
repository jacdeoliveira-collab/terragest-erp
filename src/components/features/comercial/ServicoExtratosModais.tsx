import React from 'react';
import { ClienteHistoricoModal } from './modal/ClienteHistoricoModal';
import { OperadorHistoricoModal } from './modal/OperadorHistoricoModal';
import { ReciboAdiantamentoModal } from './modal/ReciboAdiantamentoModal';
import type { Cliente } from '../../../types/comercial.types';
import type { ServicoHorimetro } from '../../../types/servicoHorimetro.types';

interface Props {
  clienteParaExtrato: Cliente | null;
  onFecharCliente: () => void;
  operadorParaExtrato: { nome: string; id?: string } | null;
  onFecharOperador: () => void;
  servicoParaRecibo: ServicoHorimetro | null;
  onFecharRecibo: () => void;
  onConfirmarAdiantamento: (valor: number, forma: string, data: string) => Promise<void>;
}

export const ServicoExtratosModais: React.FC<Props> = ({
  clienteParaExtrato, onFecharCliente,
  operadorParaExtrato, onFecharOperador,
  servicoParaRecibo, onFecharRecibo,
  onConfirmarAdiantamento
}) => {
  return (
    <>
      <ClienteHistoricoModal
        isOpen={!!clienteParaExtrato}
        onClose={onFecharCliente}
        cliente={clienteParaExtrato}
      />

      <OperadorHistoricoModal
        isOpen={!!operadorParaExtrato}
        onClose={onFecharOperador}
        operadorNome={operadorParaExtrato?.nome || ''}
        operadorId={operadorParaExtrato?.id}
      />

      {servicoParaRecibo && (
        <ReciboAdiantamentoModal
          isOpen={!!servicoParaRecibo}
          onClose={onFecharRecibo}
          clienteNome={servicoParaRecibo.cliente_nome}
          clienteDocumento={servicoParaRecibo.cliente_documento}
          clienteTelefone={servicoParaRecibo.cliente_telefone}
          descricaoOriginal={servicoParaRecibo.descricao_servico}
          valorTotalOriginal={servicoParaRecibo.faturamento_bruto}
          valorInicial={servicoParaRecibo.valor_adiantamento || 0}
          onConfirmarAdiantamento={onConfirmarAdiantamento}
        />
      )}
    </>
  );
};
