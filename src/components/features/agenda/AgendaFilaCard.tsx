import React from 'react';
import {
  MessageCircle, CheckCircle2, Truck, MapPin, Clock,
  AlertTriangle, Pencil, Trash2, ArrowUp, ArrowDown, Calendar
} from 'lucide-react';
import type { ParametrosOperacionaisEmpresa } from '../../../types/agenda.types';
import { gerarLinkWhatsappAgenda, type AgendaItemCalculado } from '../../../utils/agendaCalculoHelper';

interface Props {
  item: AgendaItemCalculado;
  index: number;
  total: number;
  parametros: ParametrosOperacionaisEmpresa;
  onConfirmar: (id: string) => void;
  onConcluir: (id: string) => void;
  onEditar: (item: AgendaItemCalculado) => void;
  onExcluir: (id: string) => void;
  onMover: (dir: 'subir' | 'descer') => void;
  onWhatsappClick: (id: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  EM_ANDAMENTO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-300',
  AGUARDANDO: 'bg-amber-100 text-amber-800 border-amber-300'
};

export const AgendaFilaCard: React.FC<Props> = ({
  item, index, total, parametros, onConfirmar, onConcluir, onEditar, onExcluir, onMover, onWhatsappClick
}) => {
  const waLink = gerarLinkWhatsappAgenda(item, parametros);
  const fmtData = (iso: string) => iso.split('-').reverse().join('/');

  return (
    <div className={`p-3.5 rounded-xl border transition-all space-y-2.5 text-left text-xs ${
      item.alertaConfirmacao ? 'bg-amber-50/70 border-amber-300 shadow-xs' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center text-[11px]">
            #{index + 1}
          </span>
          <span className="font-bold text-gray-900 text-sm">{item.cliente_nome}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[item.status] || 'bg-gray-100 text-gray-700'}`}>
            {item.status.replace('_', ' ')}
          </span>
          {item.alertaConfirmacao && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" /><span>Confirmar Cliente!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMover('subir')} title="Subir na fila" className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"><ArrowUp className="w-3.5 h-3.5" /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMover('descer')} title="Descer na fila" className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"><ArrowDown className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => onEditar(item)} title="Editar" className="p-1 text-gray-400 hover:text-amber-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => onExcluir(item.id)} title="Excluir" className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><strong>{item.horas_estimadas}h</strong> (~{item.diasEstimados} dia{item.diasEstimados > 1 ? 's' : ''})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Prev: <strong>{fmtData(item.inicioCalc)}</strong> até <strong>{fmtData(item.fimCalc)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className={`w-3.5 h-3.5 shrink-0 ${item.precisa_prancha ? 'text-amber-600' : 'text-gray-400'}`} />
          <span>
            {item.precisa_prancha ? <strong className="text-amber-800">Precisa Prancha</strong> : 'Desloc. Próprio'}
            {item.distancia_km ? ` (${item.distancia_km} km)` : ''}
          </span>
        </div>
      </div>

      {item.endereco_servico && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span>{item.endereco_servico}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {waLink ? (
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              onClick={() => onWhatsappClick(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" /><span>WhatsApp Cliente</span>
            </a>
          ) : (
            <span className="text-[10px] text-gray-400 italic">Sem telefone para WhatsApp</span>
          )}
          {item.ultimo_contato_whatsapp && (
            <span className="text-[10px] text-emerald-700 font-medium">
              Contatado em {new Date(item.ultimo_contato_whatsapp).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.status === 'AGUARDANDO' && (
            <button type="button" onClick={() => onConfirmar(item.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] cursor-pointer">
              <CheckCircle2 className="w-3.5 h-3.5" /><span>Confirmar</span>
            </button>
          )}
          {item.status !== 'CONCLUIDO' && (
            <button type="button" onClick={() => onConcluir(item.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg font-semibold text-[11px] cursor-pointer">
              <span>Concluir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
