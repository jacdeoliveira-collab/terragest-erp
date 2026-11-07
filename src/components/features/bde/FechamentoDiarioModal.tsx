import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { AlertCircle } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useServicosHorimetro } from '../../../hooks/useServicosHorimetro';
import { useTenantContext } from '../../../contexts/TenantContext';
import { useObraContext } from '../../../contexts/ObraContext';
import { uploadParaGoogleDrive } from '../../../services/driveService';
import { registrarFechamentoDiarioTarde } from '../../../services/fechamentoDiarioService';
import { FechamentoDiarioHorimetrosSection } from './FechamentoDiarioHorimetrosSection';
import type { ServicoHorimetro } from '../../../types/servicoHorimetro.types';

interface Props { isOpen: boolean; onClose: () => void; onSuccess?: () => void; }

export const FechamentoDiarioModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const { data: equipments, refetch: refetchEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios } = useFuncionarios();
  const { servicos, refetch: refetchServicos } = useServicosHorimetro();

  const [servicoId, setServicoId] = useState('');
  const [maquinaId, setMaquinaId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [horimetroInicial, setHorimetroInicial] = useState<number>(0);
  const [horimetroFinal, setHorimetroFinal] = useState<number>(0);
  const [horasProdutivas, setHorasProdutivas] = useState<number>(0);
  const [horasDeslocamento, setHorasDeslocamento] = useState<number>(0);
  const [frente, setFrente] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const servicosOrdenados = useMemo(() => [...servicos].sort((a, b) => {
    if (a.status === 'EM_ANDAMENTO' && b.status !== 'EM_ANDAMENTO') return -1;
    if (a.status !== 'EM_ANDAMENTO' && b.status === 'EM_ANDAMENTO') return 1;
    return (b.data_inicio || '').localeCompare(a.data_inicio || '');
  }), [servicos]);

  const aplicarServico = (srv: ServicoHorimetro) => {
    setServicoId(srv.id);
    const desc = srv.descricao_servico || srv.obra_nome || '';
    setFrente(`${srv.cliente_nome}${desc ? ` — ${desc}` : ''}`);
    const eqMatch = equipments.find((eq) => (srv.maquina_id && eq.id === srv.maquina_id) || (eq.code && srv.maquina_nome?.toLowerCase().includes(eq.code.toLowerCase())) || (srv.maquina_nome && srv.maquina_nome.toLowerCase().includes(eq.name.toLowerCase()))) || equipments[0];
    if (eqMatch) setMaquinaId(eqMatch.id);
    const opMatch = funcionarios.find((f) => (srv.operador_id && f.id === srv.operador_id) || (srv.operador_nome && f.nome.toLowerCase().includes(srv.operador_nome.toLowerCase())));
    if (opMatch) setOperadorId(opMatch.id);
    const hBase = Number(srv.horimetro_final) || Number(srv.horimetro_inicial) || Number(eqMatch?.current_hourmeter) || 0;
    setHorimetroInicial(hBase); setHorimetroFinal(hBase); setHorasProdutivas(0); setHorasDeslocamento(0);
  };

  useEffect(() => {
    if (isOpen && servicosOrdenados.length > 0 && !servicoId) {
      const emAndamento = servicosOrdenados.find((s) => s.status === 'EM_ANDAMENTO');
      if (emAndamento) aplicarServico(emAndamento);
    }
  }, [isOpen, servicosOrdenados.length, equipments.length, funcionarios.length]);

  const handleSelectServico = (id: string) => {
    setServicoId(id);
    const srv = servicosOrdenados.find((s) => s.id === id);
    if (srv) aplicarServico(srv);
  };

  const handleMaquinaChange = (id: string) => {
    setMaquinaId(id);
    const eq = equipments.find((e) => e.id === id);
    if (eq && !servicoId) { const h = Number(eq.current_hourmeter) || 0; setHorimetroInicial(h); setHorimetroFinal(h); }
  };

  const handleFinalChange = (val: number) => {
    setHorimetroFinal(val);
    const diff = Math.max(0, Number((val - horimetroInicial).toFixed(2)));
    setHorasProdutivas(Math.max(0, Number((diff - horasDeslocamento).toFixed(2))));
  };

  const handleDeslocamentoChange = (desloc: number) => {
    setHorasDeslocamento(desloc);
    const diff = Math.max(0, Number((horimetroFinal - horimetroInicial).toFixed(2)));
    setHorasProdutivas(Math.max(0, Number((diff - desloc).toFixed(2))));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const res = await uploadParaGoogleDrive(file, 'frota'); if (res.sucesso && res.driveUrl) setFotoUrl(res.driveUrl); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId) { setErro('Selecione o equipamento.'); return; }
    if (horimetroFinal < horimetroInicial) { setErro('Horímetro final menor que o inicial.'); return; }
    setSalvando(true); setErro(null);
    const op = funcionarios.find((f) => f.id === operadorId);
    const eq = equipments.find((e) => e.id === maquinaId);
    const srv = servicosOrdenados.find((s) => s.id === servicoId);
    const res = await registrarFechamentoDiarioTarde({
      tenantId: tenantAtivoId, obraId: srv?.obra_id || obraSelecionada?.id, servicoId: servicoId || null, clienteNome: srv?.cliente_nome,
      equipmentId: maquinaId, equipmentName: eq ? `${eq.code} - ${eq.name}` : undefined,
      operadorId: operadorId || null, operadorNome: op?.nome || srv?.operador_nome || 'Operador',
      data, horimetroInicial, horimetroFinal, horasProdutivas, horasDeslocamento, frenteServico: frente, fotoHorimetroUrl: fotoUrl
    });
    setSalvando(false);
    if (res.success) { refetchEquips(); refetchServicos(); onSuccess?.(); onClose(); } else { setErro(res.error || 'Erro ao registrar.'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fechamento Diário de Horímetro (Tarde)">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs text-left">
        {erro && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /><span>{erro}</span></div>}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Serviço / Trabalho Cadastrado *</label>
          <select value={servicoId} onChange={(e) => handleSelectServico(e.target.value)} className="w-full px-2.5 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl font-semibold text-gray-900">
            <option value="">Selecione o serviço cadastrado (ou avulso)...</option>
            {servicosOrdenados.map((s) => <option key={s.id} value={s.id}>{s.status === 'EM_ANDAMENTO' ? '⏳ [EM TRABALHO] ' : '✅ '}{s.cliente_nome} — {s.descricao_servico || s.obra_nome || 'Serviço'} ({s.horimetro_final || s.horimetro_inicial}h)</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Máquina / Equipamento *</label>
            <select required value={maquinaId} onChange={(e) => handleMaquinaChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl font-medium">
              <option value="">Selecione o equipamento...</option>
              {equipments.map((eq) => <option key={eq.id} value={eq.id}>{eq.code ? `[${eq.code}] ` : ''}{eq.name} (Atual: {eq.current_hourmeter}h)</option>)}
            </select>
          </div>
          <div><label className="block font-semibold text-gray-700 mb-1">Data *</label><input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div><label className="block font-semibold text-gray-700 mb-1">Operador Responsável</label><select value={operadorId} onChange={(e) => setOperadorId(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl"><option value="">Selecione o operador...</option>{funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
          <div><label className="block font-semibold text-gray-700 mb-1">Frente de Trabalho / Trecho</label><input placeholder="Puxado automaticamente do serviço..." value={frente} onChange={(e) => setFrente(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl" /></div>
        </div>
        <FechamentoDiarioHorimetrosSection horimetroInicial={horimetroInicial} horimetroFinal={horimetroFinal} horasProdutivas={horasProdutivas} horasDeslocamento={horasDeslocamento} horasRodadas={Math.max(0, Number((horimetroFinal - horimetroInicial).toFixed(2)))} fotoUrl={fotoUrl} uploading={uploading} onFinalChange={handleFinalChange} onProdutivasChange={setHorasProdutivas} onDeslocamentoChange={handleDeslocamentoChange} onUpload={handleUpload} />
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={salvando || !maquinaId} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">{salvando ? 'Salvando...' : 'Salvar Fechamento da Tarde'}</button>
        </div>
      </form>
    </Modal>
  );
};
