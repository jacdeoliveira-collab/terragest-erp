import React from 'react';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import { ServicoHorimetroCell } from './ServicoHorimetroCell';
import { ServicoFinanceiroCell } from './ServicoFinanceiroCell';
import { ServicoAcoesCell } from './ServicoAcoesCell';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

interface ServicoRowItemProps {
  servico: ServicoHorimetro;
  selecionado: boolean;
  onToggleSelecionar: () => void;
  onEditar: (s: ServicoHorimetro) => void;
  onExcluir: (id: string, cliente: string) => void;
  onGerarPdf: (s: ServicoHorimetro) => void;
  onGerarRelatorioCliente: (s: ServicoHorimetro) => void;
  onAbrirRecibo: (s: ServicoHorimetro) => void;
  onVerCliente?: (nome: string, id?: string) => void;
  onVerOperador?: (nome: string, id?: string) => void;
}

export const ServicoRowItem: React.FC<ServicoRowItemProps> = ({
  servico: s, selecionado, onToggleSelecionar,
  onEditar, onExcluir, onGerarPdf, onGerarRelatorioCliente,
  onAbrirRecibo, onVerCliente, onVerOperador
}) => {
  const hIni = Number(s.horimetro_inicial || 0), hFim = s.horimetro_final != null ? Number(s.horimetro_final) : null;
  const horasTrab = Number(s.horas_trabalhadas || 0), fatBruto = Number(s.faturamento_bruto || 0);
  const histTot = Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0
    ? s.adiantamentos_historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0) : 0;
  const vlrAdiant = Math.max(Number(s.valor_adiantamento || 0), histTot);
  const temAdiantamento = vlrAdiant > 0;
  const isQuitado = s.status_pagamento_cliente === 'QUITADO' || (fatBruto > 0 && (fatBruto - vlrAdiant) <= 0.05);
  const faltaReceber = isQuitado ? 0 : Math.max(0, fatBruto - vlrAdiant);
  const combTotal = Number(s.combustivel_total_valor || (s as any).combustivel_valor || 0);
  const combMaq = Number(s.combustivel_maquina_litros || 0), combApoio = Number(s.combustivel_apoio_litros || 0);
  const lucroLiq = Number(s.lucro_liquido || 0), margem = Number(s.margem_lucro || 0);

  const pMaq = s.maquinas_itens?.[0];
  const fotoIni = s.foto_horimetro_inicial || pMaq?.foto_horimetro_inicial;
  const fotoFim = s.foto_horimetro_final || pMaq?.foto_horimetro_final;

  return (
    <tr className={`hover:bg-gray-50/80 transition-all text-xs ${selecionado ? 'bg-emerald-50/50' : ''}`}>
      <td className="py-3 px-3 text-center">
        <input
          type="checkbox"
          checked={selecionado}
          onChange={onToggleSelecionar}
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
        />
      </td>
      <td className="py-3 px-4">
        <button type="button" onClick={() => onVerCliente?.(s.cliente_nome, s.cliente_id)} className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline block text-left cursor-pointer">
          {s.cliente_nome}
        </button>
        {(s.descricao_servico || s.obra_nome) && (
          <span className="text-[10px] text-teal-700 font-semibold block" title={s.descricao_servico || s.obra_nome}>
            {s.descricao_servico || s.obra_nome}
          </span>
        )}
        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
          <Truck className="w-3 h-3 text-emerald-600" />
          <span>{s.maquina_nome} • </span>
          <button type="button" onClick={() => onVerOperador?.(s.operador_nome, s.operador_id)} className="hover:text-emerald-800 hover:underline font-semibold cursor-pointer">
            {s.operador_nome}
          </button>
        </span>
      </td>
      <td className="py-3 px-3 font-mono text-gray-600 text-center">
        {s.data_inicio}
        {s.data_fim && <span className="block text-[10px] text-gray-400">até {s.data_fim}</span>}
      </td>
      <ServicoHorimetroCell
        horimetroInicial={hIni}
        horimetroFinal={hFim}
        alertaPainel={s.alerta_painel}
        maquinaNome={s.maquina_nome}
        fotoInicial={fotoIni}
        fotoFinal={fotoFim}
      />
      <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-center">{horasTrab.toFixed(1)} h</td>
      <ServicoFinanceiroCell
        faturamentoBruto={fatBruto}
        valorAdiantamento={vlrAdiant}
        temAdiantamento={temAdiantamento}
        faltaReceber={faltaReceber}
      />
      <td className="py-3 px-4 font-mono text-rose-600 text-right">
        R$ {combTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        <span className="block text-[9px] text-gray-400">Máq: {combMaq.toFixed(1)}L | Apoio: {combApoio.toFixed(1)}L</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`font-mono font-bold block ${lucroLiq >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
          R$ {lucroLiq.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[9px] text-gray-400 block font-semibold">Margem: {margem}%</span>
      </td>
      <td className="py-3 px-3 text-center">
        {s.status === 'FINALIZADO' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            <CheckCircle className="w-2.5 h-2.5" />Concluído
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
            <Clock className="w-2.5 h-2.5" />Em Andamento
          </span>
        )}
      </td>
      <ServicoAcoesCell
        servico={s}
        onEditar={onEditar}
        onExcluir={onExcluir}
        onGerarPdf={onGerarPdf}
        onGerarRelatorioCliente={onGerarRelatorioCliente}
        onAbrirRecibo={onAbrirRecibo}
      />
    </tr>
  );
};
