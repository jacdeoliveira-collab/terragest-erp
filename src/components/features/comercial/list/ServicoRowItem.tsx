import React from 'react';
import { Truck, CheckCircle, Clock, FileDown, Edit2, Trash2, Receipt, FileCheck, Camera } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

interface ServicoRowItemProps {
  servico: ServicoHorimetro;
  onEditar: (s: ServicoHorimetro) => void;
  onExcluir: (id: string, cliente: string) => void;
  onGerarPdf: (s: ServicoHorimetro) => void;
  onGerarRelatorioCliente: (s: ServicoHorimetro) => void;
  onAbrirRecibo: (s: ServicoHorimetro) => void;
  onVerCliente?: (nome: string, id?: string) => void;
  onVerOperador?: (nome: string, id?: string) => void;
}

export const ServicoRowItem: React.FC<ServicoRowItemProps> = ({
  servico: s,
  onEditar,
  onExcluir,
  onGerarPdf,
  onGerarRelatorioCliente,
  onAbrirRecibo,
  onVerCliente,
  onVerOperador
}) => {
  const hIni = Number(s.horimetro_inicial || 0), hFim = s.horimetro_final != null ? Number(s.horimetro_final) : null;
  const horasTrab = Number(s.horas_trabalhadas || 0), fatBruto = Number(s.faturamento_bruto || 0);
  const histTot = Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0
    ? s.adiantamentos_historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0) : 0;
  const vlrAdiant = Math.max(Number(s.valor_adiantamento || 0), histTot);
  const temAdiantamento = vlrAdiant > 0;
  const combTotal = Number(s.combustivel_total_valor || (s as any).combustivel_valor || 0);
  const combMaq = Number(s.combustivel_maquina_litros || 0), combApoio = Number(s.combustivel_apoio_litros || 0);
  const lucroLiq = Number(s.lucro_liquido || 0), margem = Number(s.margem_lucro || 0);

  return (
    <tr className="hover:bg-gray-50/80 transition-all text-xs">
      <td className="py-3 px-4">
        <button
          type="button"
          onClick={() => onVerCliente?.(s.cliente_nome, s.cliente_id)}
          className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline block text-left cursor-pointer"
        >
          {s.cliente_nome}
        </button>
        {s.obra_nome && (
          <span className="text-[10px] text-teal-700 font-semibold block">
            Obra: {s.obra_nome}
          </span>
        )}
        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
          <Truck className="w-3 h-3 text-emerald-600" />
          <span>{s.maquina_nome} • </span>
          <button
            type="button"
            onClick={() => onVerOperador?.(s.operador_nome, s.operador_id)}
            className="hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
          >
            {s.operador_nome}
          </button>
        </span>
      </td>
      <td className="py-3 px-3 font-mono text-gray-600 text-center">
        {s.data_inicio}
        {s.data_fim && <span className="block text-[10px] text-gray-400">até {s.data_fim}</span>}
      </td>
      <td className="py-3 px-3 font-mono text-center">
        <span className="text-gray-700">{hIni.toFixed(1)} h</span>
        <span className="text-gray-400 mx-1">➔</span>
        <span className="text-gray-900 font-bold">
          {hFim !== null ? `${hFim.toFixed(1)} h` : 'Em curso'}
        </span>
        {s.alerta_painel && (
          <span className="block text-[9px] text-amber-600 font-sans mt-0.5">
            ⚠️ {s.alerta_painel}
          </span>
        )}
        {(s.foto_horimetro_inicial || s.foto_horimetro_final) && (
          <div className="flex items-center justify-center gap-1 mt-1 font-sans">
            {s.foto_horimetro_inicial && (
              <a href={s.foto_horimetro_inicial} target="_blank" rel="noopener noreferrer" title="Foto Horímetro Inicial (Drive / Anexo)" className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[9px] font-semibold border border-blue-200">
                <Camera className="w-2.5 h-2.5" /><span>Ini</span>
              </a>
            )}
            {s.foto_horimetro_final && (
              <a href={s.foto_horimetro_final} target="_blank" rel="noopener noreferrer" title="Foto Horímetro Final (Drive / Anexo)" className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[9px] font-semibold border border-emerald-200">
                <Camera className="w-2.5 h-2.5" /><span>Fim</span>
              </a>
            )}
          </div>
        )}
      </td>
      <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-center">
        {horasTrab.toFixed(1)} h
      </td>
      <td className="py-3 px-4 font-mono text-right">
        <span className="font-bold text-gray-900 block">
          R$ {fatBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        {temAdiantamento && (
          <span className="text-[10px] text-emerald-600 font-semibold block">
            Recebido: R$ {vlrAdiant.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </td>
      <td className="py-3 px-4 font-mono text-rose-600 text-right">
        R$ {combTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        <span className="block text-[9px] text-gray-400">
          Máq: {combMaq.toFixed(1)}L | Apoio: {combApoio.toFixed(1)}L
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`font-mono font-bold block ${lucroLiq >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
          R$ {lucroLiq.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[9px] text-gray-400 block font-semibold">
          Margem: {margem}%
        </span>
      </td>
      <td className="py-3 px-3 text-center">
        {s.status === 'FINALIZADO' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            <CheckCircle className="w-2.5 h-2.5" />
            Concluído
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
            <Clock className="w-2.5 h-2.5" />
            Em Andamento
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onGerarRelatorioCliente(s)} title="Relatório Executivo" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"><FileCheck className="w-4 h-4" /></button>
          <button onClick={() => onAbrirRecibo(s)} title="Emitir Recibo" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"><Receipt className="w-4 h-4" /></button>
          <button onClick={() => onGerarPdf(s)} title="Boletim PDF" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"><FileDown className="w-4 h-4" /></button>
          <button onClick={() => onEditar(s)} title="Editar" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onExcluir(s.id, s.cliente_nome)} title="Excluir" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
};
