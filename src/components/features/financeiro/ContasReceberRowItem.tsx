import React from 'react';
import { Check, CheckCircle2, Receipt, PlusCircle, Trash2 } from 'lucide-react';
import type { MedicaoItem } from '../../../types/faturamento.types';
import { gerarReciboPDF } from '../../../utils/reciboPdfGenerator';

interface Props {
  item: MedicaoItem;
  hoje: string;
  onAbrirBaixa: (item: MedicaoItem) => void;
  onAbrirHaver: (item: MedicaoItem) => void;
  onExcluir?: (item: MedicaoItem) => void;
}

const formatBRL = (val: number) => (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ContasReceberRowItem: React.FC<Props> = ({
  item,
  hoje,
  onAbrirBaixa,
  onAbrirHaver,
  onExcluir
}) => {
  const isPago = item.status_pagamento === 'PAGO';
  const isParcial = item.status_pagamento === 'PAGO_PARCIAL' || (Number(item.valor_adiantamento || 0) > 0 && !isPago);
  const isAtrasado = !isPago && item.data_vencimento < hoje;
  const saldo = item.saldo_restante !== undefined ? Number(item.saldo_restante) : (isPago ? 0 : Number(item.valor_total));
  const adiant = Number(item.valor_adiantamento || 0);

  const emitirReciboTitulo = () => {
    gerarReciboPDF({
      numeroRecibo: `REC-${item.numero_medicao?.replace(/\D/g, '') || '001'}`,
      valor: isPago ? Number(item.valor_total) : (adiant > 0 ? adiant : Number(item.valor_total)),
      clienteNome: item.cliente_nome || 'Cliente',
      clienteDocumento: item.cliente_documento,
      clienteTelefone: item.cliente_telefone,
      dataPagamento: item.data_pagamento || item.data_vencimento,
      formaPagamento: item.forma_pagamento || 'PIX',
      referente: `${isPago ? 'Quitação total' : 'Recebimento de Haver'} referente ao serviço ${item.numero_medicao} (${item.obra_nome})`
    });
  };

  return (
    <tr className={`hover:bg-gray-50/60 transition-colors ${isAtrasado ? 'bg-rose-50/30' : ''}`}>
      <td className="p-3">
        <div className="font-bold text-gray-900 text-xs">{item.cliente_nome || 'Cliente'}</div>
        <div className="text-[11px] text-gray-500 font-medium">
          {item.obra_nome} • <span className="font-mono text-gray-700">{item.numero_medicao}</span>
        </div>
      </td>
      <td className="p-3 font-mono font-medium text-gray-700">{item.competencia}</td>
      <td className="p-3 font-mono">
        <div className={isAtrasado ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-gray-700'}>
          {new Date(item.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
          {isAtrasado && <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-md font-bold">ATRASADO</span>}
        </div>
      </td>
      <td className="p-3 text-right font-mono">
        <div className="font-bold text-gray-900 text-xs">
          {formatBRL(saldo > 0 ? saldo : Number(item.valor_total))}
        </div>
        {adiant > 0 && !isPago && (
          <div className="text-[10px] text-emerald-700 font-semibold">
            Haver pago: {formatBRL(adiant)}
          </div>
        )}
        <div className="text-[10px] text-gray-400">Total: {formatBRL(Number(item.valor_total))}</div>
      </td>
      <td className="p-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          isPago ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          isParcial ? 'bg-blue-50 text-blue-700 border-blue-200' :
          isAtrasado ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isPago ? 'PAGO' : isParcial ? 'HAVER PARCIAL' : isAtrasado ? 'EM ATRASO' : 'A VENCER'}
        </span>
      </td>
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {!isPago ? (
            <>
              <button
                type="button"
                onClick={() => onAbrirHaver(item)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition-colors"
                title="Registrar haver ou pagamento parcial deste serviço"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Haver</span>
              </button>

              <button
                type="button"
                onClick={() => onAbrirBaixa(item)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition-colors"
                title="Quitar o saldo total deste título"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </button>
            </>
          ) : (
            <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Check className="w-3 h-3" /> Liquidado
            </span>
          )}

          <button
            type="button"
            onClick={emitirReciboTitulo}
            className="px-2 py-1 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Emitir Recibo Oficial TerraGest em PDF"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recibo</span>
          </button>

          {onExcluir && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Deseja realmente excluir este lançamento a receber (${item.numero_medicao || item.cliente_nome})?`)) {
                  onExcluir(item);
                }
              }}
              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
              title="Excluir este lançamento / título duplicado"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
