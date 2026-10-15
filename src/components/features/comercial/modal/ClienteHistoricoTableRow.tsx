import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle, Camera } from 'lucide-react';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import type { AdiantamentoItem, ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import { gerarReciboPDF } from '../../../../utils/reciboPdfGenerator';

interface Props {
  servico: ServicoHorimetro;
  selecionado: boolean;
  onToggleSelecionar: () => void;
}

export const ClienteHistoricoTableRow: React.FC<Props> = ({ servico, selecionado, onToggleSelecionar }) => {
  const fat = Number(servico.faturamento_bruto || 0);
  const adiant = Number(servico.valor_adiantamento || 0);
  const saldo = Number(servico.saldo_restante !== undefined ? servico.saldo_restante : Math.max(0, fat - adiant));

  const statusFinanceiro = servico.status_pagamento_cliente || (
    fat > 0 && adiant >= fat ? 'QUITADO' : (adiant > 0 ? 'PARCIAL' : 'PENDENTE')
  );

  const dataAdiant = servico.data_adiantamento ? servico.data_adiantamento.split('-').reverse().slice(0, 2).join('/') : '';

  const emitirReciboIndividual = (item: AdiantamentoItem, idx: number) => {
    gerarReciboPDF({
      numeroRecibo: `REC-${new Date().getFullYear()}/${item.id?.slice(-4).toUpperCase() || (idx + 1)}`,
      valor: Number(item.valor),
      clienteNome: servico.cliente_nome,
      clienteDocumento: servico.cliente_documento,
      clienteTelefone: servico.cliente_telefone,
      dataPagamento: item.data,
      formaPagamento: item.forma_pagamento,
      referente: `${item.observacao || `Parcela ${idx + 1} (A Haver)`} ref. à máquina ${servico.maquina_nome}`,
      observacoes: servico.observacoes
    });
  };

  const handleEmitirRecibo = () => {
    gerarReciboPDF({
      numeroRecibo: `REC-${new Date().getFullYear()}/${servico.id.slice(0, 5).toUpperCase()}`,
      valor: adiant > 0 ? adiant : fat,
      clienteNome: servico.cliente_nome,
      clienteDocumento: servico.cliente_documento,
      clienteTelefone: servico.cliente_telefone,
      dataPagamento: servico.data_adiantamento || servico.data_inicio,
      formaPagamento: servico.forma_pagamento_adiantamento || 'PIX',
      referente: `Serviço na máquina ${servico.maquina_nome} (${servico.horas_trabalhadas}h)`,
      observacoes: servico.observacoes
    });
  };

  return (
    <tr className={`hover:bg-gray-50/80 transition-colors ${selecionado ? 'bg-emerald-50/40' : ''}`}>
      <td className="p-2.5 text-center">
        <input
          type="checkbox"
          checked={selecionado}
          onChange={onToggleSelecionar}
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
        />
      </td>
      <td className="p-2.5">
        <div className="font-mono text-[11px] text-gray-500">{servico.data_inicio}</div>
        <div className="font-semibold text-gray-900">{servico.maquina_nome || '-'}</div>
      </td>
      <td className="p-2.5 text-gray-600">
        <div className="truncate max-w-[140px]" title={servico.descricao_servico}>{servico.descricao_servico || '-'}</div>
        <div className="text-[10px] text-gray-400 font-mono">Op: {servico.operador_nome || '-'}</div>
      </td>
      <td className="p-2.5 text-right font-mono font-bold text-gray-800">
        R$ {fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className="p-2.5 text-right font-mono">
        {adiant > 0 ? (
          <div>
            <span className="font-bold text-emerald-800">R$ {adiant.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            {servico.adiantamentos_historico && servico.adiantamentos_historico.length > 0 ? (
              <div className="space-y-1 mt-1">
                {servico.adiantamentos_historico.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-end gap-1.5 text-[9px]">
                    <span className="text-emerald-800 font-medium font-mono">
                      {item.data.split('-').reverse().slice(0, 2).join('/')}: R$ {Number(item.valor).toFixed(0)} ({item.forma_pagamento})
                    </span>
                    {item.comprovante_url && (
                      <button type="button" onClick={() => abrirVisualizacaoImagem(item.comprovante_url, 'Comprovante do Adiantamento')} title="Ver Comprovante" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                    <button type="button" onClick={() => emitirReciboIndividual(item, idx)} title="Recibo da Parcela" className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                      <FileText className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              dataAdiant && <span className="block text-[10px] text-emerald-700 font-medium">Pago em {dataAdiant}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-[11px]">Nenhum</span>
        )}
      </td>
      <td className="p-2.5 text-right font-mono font-bold">
        <span className={saldo > 0 ? 'text-rose-600' : 'text-emerald-600'}>
          R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="p-2.5 text-center">
        {statusFinanceiro === 'QUITADO' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Quitado
          </span>
        )}
        {statusFinanceiro === 'PARCIAL' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Parcial
          </span>
        )}
        {statusFinanceiro === 'PENDENTE' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
            <AlertCircle className="w-3 h-3" /> Aberto
          </span>
        )}
      </td>
      <td className="p-2.5 text-center">
        <button
          type="button" onClick={handleEmitirRecibo} title="Imprimir Recibo em PDF"
          className="p-1.5 text-emerald-700 hover:bg-emerald-100/70 rounded-lg cursor-pointer transition-colors"
        >
          <FileText className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
