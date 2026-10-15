import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Tag } from 'lucide-react';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';
import { AdiantamentoFormInput } from './AdiantamentoFormInput';
import { AdiantamentosListRows } from './AdiantamentosListRows';

interface Props {
  clienteNome: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  descricaoServico: string;
  faturamentoBruto: number;
  adiantamentos: AdiantamentoItem[];
  onAdicionar: (item: Omit<AdiantamentoItem, 'id'>) => void;
  onRemover: (id: string) => void;
  onSalvarSinal?: () => Promise<boolean>;
}

export const AdiantamentosHistoricoSection: React.FC<Props> = ({
  clienteNome, clienteDocumento, clienteTelefone, descricaoServico,
  faturamentoBruto, adiantamentos, onAdicionar, onRemover, onSalvarSinal
}) => {
  const [sucesso, setSucesso] = useState(false);

  const totalDescontos = Number(
    adiantamentos.filter((i) => i.forma_pagamento === 'DESCONTO').reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2)
  );
  const totalPago = Number(
    adiantamentos.filter((i) => i.forma_pagamento !== 'DESCONTO').reduce((acc, i) => acc + (Number(i.valor) || 0), 0).toFixed(2)
  );
  const totalAbatido = Number((totalPago + totalDescontos).toFixed(2));
  const diffSaldo = faturamentoBruto - totalAbatido;
  const saldoRestante = diffSaldo <= 0.05 ? 0 : Number(diffSaldo.toFixed(2));

  const handleAdd = (item: Omit<AdiantamentoItem, 'id'>) => {
    onAdicionar(item);
    if (onSalvarSinal) {
      setTimeout(async () => {
        await onSalvarSinal();
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }, 50);
    }
  };

  const handleRemover = (id: string) => {
    onRemover(id);
    if (onSalvarSinal) setTimeout(() => onSalvarSinal(), 50);
  };

  return (
    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 text-left text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase tracking-wider">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Histórico de Recebimentos, Haveres & Descontos</span>
        </div>
        <span className="font-mono text-emerald-800 font-bold">
          Total Pago: R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {saldoRestante > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50/90 border border-amber-300 rounded-lg">
          <div className="text-[11px] text-amber-900">
            <span>Saldo em aberto: </span>
            <strong className="font-mono text-xs text-rose-700">
              R$ {saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAdd({
                valor: saldoRestante,
                forma_pagamento: 'DESCONTO',
                data: new Date().toISOString().slice(0, 10),
                observacao: 'Desconto comercial / abatimento para quitação'
              })}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer inline-flex items-center gap-1"
              title="Conceder desconto no valor restante para quitar o serviço"
            >
              <Tag className="w-3 h-3" />
              <span>Conceder Desconto (R$ {saldoRestante.toFixed(2)})</span>
            </button>
            <button
              type="button"
              onClick={() => handleAdd({
                valor: saldoRestante,
                forma_pagamento: 'PIX',
                data: new Date().toISOString().slice(0, 10),
                observacao: 'Quitação total do saldo restante'
              })}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer inline-flex items-center gap-1"
              title="Receber e quitar o saldo integral restante"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Quitar Saldo (R$ {saldoRestante.toFixed(2)})</span>
            </button>
          </div>
        </div>
      )}

      <AdiantamentoFormInput onAdicionar={handleAdd} isFirst={adiantamentos.length === 0} />

      {sucesso && (
        <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Pagamento / Desconto gravado com sucesso!</span>
        </div>
      )}

      {adiantamentos.length > 0 && (
        <AdiantamentosListRows
          adiantamentos={adiantamentos} clienteNome={clienteNome}
          clienteDocumento={clienteDocumento} clienteTelefone={clienteTelefone}
          descricaoServico={descricaoServico} onRemover={handleRemover}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200 text-[11px]">
        <span>Faturamento: <strong>R$ {faturamentoBruto.toFixed(2)}</strong></span>
        {totalDescontos > 0 && (
          <span className="text-amber-800 font-bold">
            Desconto: <strong>(-) R$ {totalDescontos.toFixed(2)}</strong>
          </span>
        )}
        <span className="text-emerald-700 font-bold">Total Recebido: <strong>R$ {totalPago.toFixed(2)}</strong></span>
        <span className={saldoRestante > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
          {saldoRestante > 0 ? `Saldo a Receber: R$ ${saldoRestante.toFixed(2)}` : '✓ Quitado'}
        </span>
      </div>
    </div>
  );
};
