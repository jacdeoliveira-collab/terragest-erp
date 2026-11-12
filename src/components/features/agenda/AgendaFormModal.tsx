import React, { useState, useEffect } from 'react';
import { X, Calendar, Truck, MapPin, Clock, Save } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useClientes } from '../../../hooks/useClientes';
import type { AgendaOperacionalItem, CreateAgendaDTO, StatusAgendaOperacional } from '../../../types/agenda.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemEdicao?: AgendaOperacionalItem | null;
  proximaOrdem: number;
  onSalvar: (dto: CreateAgendaDTO, editId?: string) => Promise<void>;
}

export const AgendaFormModal: React.FC<Props> = ({
  isOpen, onClose, itemEdicao, proximaOrdem, onSalvar
}) => {
  const { data: equipments } = useEquipments();
  const { clientes } = useClientes();
  const [maquinaId, setMaquinaId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [precisaPrancha, setPrecisaPrancha] = useState(false);
  const [horasEst, setHorasEst] = useState('8');
  const [status, setStatus] = useState<StatusAgendaOperacional>('AGUARDANDO');
  const [dataInicio, setDataInicio] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (itemEdicao) {
      setMaquinaId(itemEdicao.maquina_id || ''); setClienteId(itemEdicao.cliente_id || '');
      setClienteNome(itemEdicao.cliente_nome || ''); setTelefone(itemEdicao.cliente_telefone || '');
      setEndereco(itemEdicao.endereco_servico || ''); setDistanciaKm(itemEdicao.distancia_km ? String(itemEdicao.distancia_km) : '');
      setPrecisaPrancha(Boolean(itemEdicao.precisa_prancha)); setHorasEst(String(itemEdicao.horas_estimadas || 8));
      setStatus(itemEdicao.status || 'AGUARDANDO'); setDataInicio(itemEdicao.data_inicio_prevista || '');
      setObs(itemEdicao.observacoes || '');
    } else {
      setMaquinaId(equipments[0]?.id || ''); setClienteId(''); setClienteNome(''); setTelefone('');
      setEndereco(''); setDistanciaKm(''); setPrecisaPrancha(false); setHorasEst('8');
      setStatus('AGUARDANDO'); setDataInicio(''); setObs('');
    }
  }, [isOpen, itemEdicao, equipments]);

  if (!isOpen) return null;

  const handleClienteSelect = (id: string) => {
    setClienteId(id);
    const cli = clientes.find((c) => c.id === id);
    if (cli) {
      setClienteNome(cli.nome);
      if (cli.telefone) setTelefone(cli.telefone);
      if (cli.endereco) setEndereco(cli.endereco);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome.trim()) return;
    const eq = equipments.find((x) => x.id === maquinaId);
    setSalvando(true);
    try {
      await onSalvar({
        maquina_id: maquinaId || null, maquina_nome: eq ? `${eq.code} - ${eq.name}` : 'Máquina',
        cliente_id: clienteId || null, cliente_nome: clienteNome.trim(), cliente_telefone: telefone.trim() || null,
        endereco_servico: endereco.trim() || null, distancia_km: Number(distanciaKm) || 0, precisa_prancha: precisaPrancha,
        horas_estimadas: Math.max(1, Number(horasEst) || 8), ordem_fila: itemEdicao ? itemEdicao.ordem_fila : proximaOrdem,
        status, data_inicio_prevista: dataInicio || null, observacoes: obs.trim() || null
      }, itemEdicao?.id);
      onClose();
    } finally { setSalvando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-400" /><h3 className="font-bold text-sm">{itemEdicao ? 'Editar Agendamento' : 'Novo Agendamento na Fila'}</h3></div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block font-semibold text-gray-700 mb-1">Máquina / Equipamento *</label><select value={maquinaId} onChange={(e) => setMaquinaId(e.target.value)} required className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">{equipments.map((eq) => (<option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>))}</select></div>
            <div><label className="block font-semibold text-gray-700 mb-1">Cliente Cadastrado</label><select value={clienteId} onChange={(e) => handleClienteSelect(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"><option value="">Selecionar ou digitar abaixo...</option>{clientes.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}</select></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nome do Cliente *</label>
              <input type="text" required value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente / fazenda" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">WhatsApp / Telefone</label>
              <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(99) 99999-9999" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /><span>Endereço / Local da Obra</span></label>
            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Ex: Fazenda Boa Vista, Estrada Vicinal Km 12" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /><span>Expectativa (Horas) *</span></label>
              <input type="number" step="0.5" min="1" required value={horasEst} onChange={(e) => setHorasEst(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Distância (km)</label>
              <input type="number" step="0.5" min="0" value={distanciaKm} onChange={(e) => setDistanciaKm(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as StatusAgendaOperacional)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="AGUARDANDO">Aguardando</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <label className="flex items-center gap-2 font-semibold text-amber-950 cursor-pointer">
              <input type="checkbox" checked={precisaPrancha} onChange={(e) => setPrecisaPrancha(e.target.checked)} className="w-4 h-4 accent-amber-600 rounded" />
              <Truck className="w-4 h-4 text-amber-700" /><span>Precisa de Prancha / Reboque</span>
            </label>
            <div>
              <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Início Mínimo (Opcional)</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg outline-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" disabled={salvando} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer">
              <Save className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Salvar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
