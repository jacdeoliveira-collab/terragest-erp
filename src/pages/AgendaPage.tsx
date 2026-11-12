import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Settings, AlertTriangle, Truck, Clock, RefreshCw } from 'lucide-react';
import { useAgendaOperacional } from '../hooks/useAgendaOperacional';
import { calcularPrevisoesFila } from '../utils/agendaCalculoHelper';
import { AgendaFilaCard } from '../components/features/agenda/AgendaFilaCard';
import { AgendaFormModal } from '../components/features/agenda/AgendaFormModal';
import type { AgendaOperacionalItem, CreateAgendaDTO } from '../types/agenda.types';

export const AgendaPage: React.FC = () => {
  const {
    itens, parametros, isLoading, error, refetch,
    criarAgendamento, atualizarAgendamento, excluirAgendamento,
    registrarWhatsapp, moverNaFila
  } = useAgendaOperacional();

  const [modalOpen, setModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<AgendaOperacionalItem | null>(null);
  const [filtroMaquina, setFiltroMaquina] = useState<string>('TODAS');

  const gruposPorMaquina = useMemo(() => {
    const map = new Map<string, { nome: string; itens: AgendaOperacionalItem[] }>();
    itens.filter((i) => i.status !== 'CONCLUIDO' && i.status !== 'CANCELADO').forEach((item) => {
      const key = item.maquina_id || item.maquina_nome || 'SEM_MAQUINA';
      const atual = map.get(key) || { nome: item.maquina_nome || 'Máquina', itens: [] };
      atual.itens.push(item);
      map.set(key, atual);
    });
    const resultado: { key: string; nome: string; fila: ReturnType<typeof calcularPrevisoesFila> }[] = [];
    map.forEach((v, k) => {
      if (filtroMaquina === 'TODAS' || filtroMaquina === k) {
        resultado.push({ key: k, nome: v.nome, fila: calcularPrevisoesFila(v.itens, parametros) });
      }
    });
    return resultado;
  }, [itens, parametros, filtroMaquina]);

  const totais = useMemo(() => {
    const todos = gruposPorMaquina.flatMap((g) => g.fila);
    return {
      total: todos.length,
      horas: todos.reduce((a, b) => a + (Number(b.horas_estimadas) || 0), 0),
      alertas: todos.filter((x) => x.alertaConfirmacao).length,
      pranchas: todos.filter((x) => x.precisa_prancha).length
    };
  }, [gruposPorMaquina]);

  const handleSalvar = async (dto: CreateAgendaDTO, editId?: string) => {
    if (editId) await atualizarAgendamento(editId, dto);
    else await criarAgendamento(dto);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Agenda & Fila de Máquinas</h1>
            <p className="text-xs text-gray-500">Ordem de atendimento, previsão de horas, necessidade de prancha e confirmação via WhatsApp.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/minha-empresa?aba=operacional" className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">
            <Settings className="w-3.5 h-3.5" /><span>Parâmetros ({parametros.horas_dia_padrao || 8}h/dia)</span>
          </Link>
          <button type="button" onClick={refetch} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 cursor-pointer" title="Atualizar">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={() => { setItemEdicao(null); setModalOpen(true); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /><span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
          <strong>Atenção:</strong> Execute a migração <code className="font-mono bg-amber-100 px-1 rounded">54_agenda_operacional_maquinas.sql</code> no Supabase SQL Editor caso a tabela ainda não tenha sido criada. ({error})
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-gray-200 rounded-xl"><p className="text-gray-500">Serviços na Fila</p><p className="text-lg font-bold text-gray-900">{totais.total}</p></div>
        <div className="p-3.5 bg-white border border-gray-200 rounded-xl"><p className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" />Horas Previstas</p><p className="text-lg font-bold text-emerald-700">{totais.horas}h</p></div>
        <div className="p-3.5 bg-white border border-gray-200 rounded-xl"><p className="text-gray-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-600" />Alertas Confirmar</p><p className="text-lg font-bold text-rose-600">{totais.alertas}</p></div>
        <div className="p-3.5 bg-white border border-gray-200 rounded-xl"><p className="text-gray-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-600" />Pranchas / Reboque</p><p className="text-lg font-bold text-amber-700">{totais.pranchas}</p></div>
      </div>

      {gruposPorMaquina.length === 0 && !isLoading ? (
        <div className="p-10 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-500 space-y-2">
          <p>Nenhum serviço agendado na fila operacional.</p>
          <button type="button" onClick={() => { setItemEdicao(null); setModalOpen(true); }} className="text-emerald-600 font-bold hover:underline cursor-pointer">+ Agendar primeiro cliente</button>
        </div>
      ) : (
        <div className="space-y-5">
          {gruposPorMaquina.map((grupo) => (
            <div key={grupo.key} className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{grupo.nome} ({grupo.fila.length} na fila)</span>
                </h2>
                <select value={filtroMaquina} onChange={(e) => setFiltroMaquina(e.target.value)} className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <option value="TODAS">Todas as Máquinas</option>
                  {gruposPorMaquina.map((g) => (<option key={g.key} value={g.key}>{g.nome}</option>))}
                </select>
              </div>
              <div className="space-y-2.5">
                {grupo.fila.map((item, idx) => (
                  <AgendaFilaCard
                    key={item.id} item={item} index={idx} total={grupo.fila.length} parametros={parametros}
                    onConfirmar={(id) => atualizarAgendamento(id, { status: 'CONFIRMADO' })}
                    onConcluir={(id) => atualizarAgendamento(id, { status: 'CONCLUIDO' })}
                    onEditar={(it) => { setItemEdicao(it); setModalOpen(true); }}
                    onExcluir={(id) => { if (confirm('Remover agendamento da fila?')) excluirAgendamento(id); }}
                    onMover={(dir) => moverNaFila(item, dir, grupo.fila)}
                    onWhatsappClick={registrarWhatsapp}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AgendaFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} itemEdicao={itemEdicao} proximaOrdem={itens.length + 1} onSalvar={handleSalvar} />
    </div>
  );
};
export default AgendaPage;
