import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Gauge, AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useServicosHorimetro } from '../../../hooks/useServicosHorimetro';
import type { AgendaOperacionalItem } from '../../../types/agenda.types';

interface Props {
  item: AgendaOperacionalItem | null;
  onClose: () => void;
  onServicoCriado: (agendaId: string, servicoId?: string) => Promise<void>;
}

export const IniciarServicoAgendaModal: React.FC<Props> = ({ item, onClose, onServicoCriado }) => {
  const navigate = useNavigate();
  const { data: equipments } = useEquipments();
  const { data: funcionarios } = useFuncionarios();
  const { salvarServico } = useServicosHorimetro();

  const [operadorId, setOperadorId] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState(() => new Date().toTimeString().slice(0, 5));
  const [horimetroInicial, setHorimetroInicial] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    const eq = equipments.find((e) => e.id === item.maquina_id);
    setOperadorId(item.operador_id || funcionarios[0]?.id || '');
    setDataInicio(new Date().toISOString().slice(0, 10));
    setHoraInicio(new Date().toTimeString().slice(0, 5));
    setHorimetroInicial(eq?.current_hourmeter ? String(eq.current_hourmeter) : '');
    setValorHora('');
    setDescricao(item.endereco_servico || item.observacoes || 'Serviço de Locação por Horímetro');
    setErro(null);
  }, [item, equipments, funcionarios]);

  if (!item) return null;

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    const hIni = Number(horimetroInicial);
    if (!Number.isFinite(hIni) || hIni < 0) { setErro('Informe um horímetro inicial válido.'); return; }
    setSalvando(true); setErro(null);
    try {
      const op = funcionarios.find((f) => f.id === operadorId);
      const vHora = Number(valorHora) || 0;
      const vHoraOp = Number(op?.custo_hora_normal) || 0;
      const res = await salvarServico({
        cliente_id: item.cliente_id || undefined,
        cliente_nome: item.cliente_nome,
        cliente_telefone: item.cliente_telefone || undefined,
        maquina_id: item.maquina_id || undefined,
        maquina_nome: item.maquina_nome || 'Máquina',
        operador_id: op?.id || item.operador_id || undefined,
        operador_nome: op?.nome || item.operador_nome || 'Operador',
        descricao_servico: descricao.trim() || 'Serviço de Locação por Horímetro',
        data_inicio: dataInicio,
        horimetro_inicial: hIni,
        valor_hora: vHora,
        valor_hora_operador: vHoraOp,
        horas_trabalhadas: 0,
        faturamento_bruto: 0,
        status: 'EM_ANDAMENTO',
        observacoes: `Iniciado via Agenda em ${dataInicio} às ${horaInicio}.${item.observacoes ? ` ${item.observacoes}` : ''}`
      });
      if (!res.success) { setErro(res.error || 'Falha ao abrir serviço por horímetro.'); return; }
      await onServicoCriado(item.id, res.data?.id);
      onClose();
      navigate('/comercial');
    } finally { setSalvando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="p-4 px-5 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2"><Play className="w-4 h-4 fill-current" /><h3 className="font-bold text-sm">Iniciar Serviço por Horímetro</h3></div>
          <button type="button" onClick={onClose} className="p-1 text-emerald-100 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleConfirmar} className="p-5 space-y-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5">
            <p className="font-bold text-emerald-950">{item.cliente_nome}</p>
            <p className="text-[11px] text-emerald-800">{item.maquina_nome || 'Máquina selecionada'}</p>
          </div>

          {erro && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{erro}</span></div>}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Operador *</label>
            <select value={operadorId} onChange={(e) => setOperadorId(e.target.value)} required className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl">
              <option value="">Selecione o operador...</option>
              {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block font-semibold text-gray-700 mb-1">Data de Início *</label><input type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" /></div>
            <div><label className="block font-semibold text-gray-700 mb-1">Hora de Início *</label><input type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-emerald-600" /><span>Horímetro Inicial *</span></label>
              <input type="number" step="0.1" min="0" required value={horimetroInicial} onChange={(e) => setHorimetroInicial(e.target.value)} placeholder="Ex: 4466.5" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Valor Hora (R$) *</label>
              <input type="number" step="0.01" min="0" required value={valorHora} onChange={(e) => setValorHora(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descrição do Serviço</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={salvando} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50">
              <Play className="w-3.5 h-3.5 fill-current" /><span>{salvando ? 'Iniciando...' : 'Iniciar Serviço'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
