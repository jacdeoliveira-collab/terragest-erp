import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, Plus, Pencil, Trash2, RefreshCw, Power, Crown } from 'lucide-react';
import { usePlanosContext } from '../../../../contexts/PlanosContext';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../../../../types/planos.types';
import { MasterPlanoEditModal } from '../MasterPlanoEditModal';
import { MasterAsaasKeyBar } from '../components/MasterAsaasKeyBar';
import type { TenantMaster, UpdateTenantDTO } from '../../../../types/tenant.types';
import type { ModuleToggle } from '../types/master.types';

interface MasterPlanosTogglesTabProps {
  tenants: TenantMaster[];
  modules?: ModuleToggle[];
  onToggleModule?: (id: string) => void;
  onUpdateTenant: (id: string, payload: UpdateTenantDTO) => Promise<{ success: boolean }>;
}

export const MasterPlanosTogglesTab: React.FC<MasterPlanosTogglesTabProps> = ({ tenants, onUpdateTenant }) => {
  const { planos, isLoading, error, refetch, criarPlano, atualizarPlano, alternarModuloPlano, excluirPlano } = usePlanosContext();
  const [planoEditando, setPlanoEditando] = useState<PlanoSaasRecord | null>(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [planoMatrizId, setPlanoMatrizId] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const planoMatriz = planos.find((p) => p.id === planoMatrizId) || planos[0] || null;
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  const handleAtribuirPlanoCliente = async (plano: PlanoSaasRecord) => {
    if (!selectedTenant) return;
    await onUpdateTenant(selectedTenant.id, {
      plano: plano.codigo as any, plano_valor: plano.valor_mensal,
      valor_mensalidade: plano.valor_mensal, limite_usuarios: plano.limite_usuarios
    });
    setFeedback(`Plano ${plano.nome} atribuído para ${selectedTenant.nome}.`);
  };

  const handleExcluir = async (p: PlanoSaasRecord) => {
    if (!window.confirm(`Deseja realmente excluir o plano "${p.nome}" (${p.codigo})?`)) return;
    const res = await excluirPlano(p.id, p.codigo);
    setFeedback(res.success ? `Plano ${p.nome} excluído com sucesso.` : (res.error || 'Erro ao excluir plano.'));
  };

  const handleSincronizarAsaas = async (p: PlanoSaasRecord) => {
    setFeedback(`Sincronizando valor R$ ${p.valor_mensal.toFixed(2)} do ${p.nome} no Asaas...`);
    try {
      const resp = await fetch('/api/saas-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sincronizar_preco_plano', codigoPlano: p.codigo, novoValor: p.valor_mensal, novoLimiteUsuarios: p.limite_usuarios })
      });
      const json = await resp.json();
      setFeedback(`Reajuste sincronizado: ${json.tenantsAtualizados || 0} empresa(s) e ${json.atualizadosAsaas || 0} assinatura(s) Asaas atualizadas.`);
    } catch { setFeedback('Falha ao sincronizar reajuste com o Asaas.'); }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /><span>Planos & Assinaturas — CRUD Comercial e Reajuste Asaas</span>
            </h3>
            <p className="text-[11px] text-gray-400">Crie, edite, ative/desative ou exclua planos e configure os 13 módulos operacionais de cada pacote.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => refetch()} className="p-2 bg-[#0d1117] border border-[#30363d] text-gray-300 hover:text-white rounded-lg cursor-pointer" title="Recarregar"><RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /></button>
            <button type="button" onClick={() => { setPlanoEditando(null); setModalNovoAberto(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Novo Plano</span></button>
          </div>
        </div>

        {feedback && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">{feedback}</div>}
        {error && <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">{error}</div>}

        <MasterAsaasKeyBar />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {planos.map((p) => {
            const selecionado = planoMatriz?.id === p.id;
            const qtdAssinantes = tenants.filter((t) => (t.plano || '').toUpperCase() === p.codigo.toUpperCase()).length;
            return (
              <div key={p.id} onClick={() => setPlanoMatrizId(p.id)} className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${selecionado ? 'bg-amber-500/10 border-amber-500/60' : 'bg-[#0d1117] border-[#21262d] hover:border-[#30363d]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-amber-400 uppercase">{p.codigo}</span>
                      {p.destaque && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold"><Crown className="w-2.5 h-2.5" /> Mais Escolhido</span>}
                    </div>
                    <h4 className="text-sm font-bold text-white">{p.nome}</h4>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => atualizarPlano(p.id, { ativo: !p.ativo })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer" title={p.ativo ? 'Desativar' : 'Ativar'}><Power className={`w-3.5 h-3.5 ${p.ativo ? 'text-emerald-400' : 'text-rose-400'}`} /></button>
                    <button type="button" onClick={() => { setPlanoEditando(p); setModalNovoAberto(true); }} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExcluir(p)} className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2">{p.descricao || 'Sem descrição'}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                  <span className="font-mono text-base font-bold text-emerald-400">R$ {p.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.ativo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>{p.ativo ? 'ATIVO' : 'INATIVO'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{p.modulos_habilitados.length}/{MODULOS_SISTEMA.length} módulos • Até {p.limite_usuarios} usuários</span>
                  <span className="font-bold text-amber-300">{qtdAssinantes} assinante(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {planoMatriz && (
        <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Matriz dos 13 Módulos Operacionais — <span className="text-amber-400">{planoMatriz.nome}</span></h3>
              <p className="text-[11px] text-gray-400">Alterações refletem imediatamente no Contrato de Adesão (/register) e no acesso das empresas.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button type="button" onClick={() => handleSincronizarAsaas(planoMatriz)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-300 font-bold rounded-lg cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /><span>Sincronizar Preço no Asaas</span></button>
              {selectedTenant && (
                <>
                  <select value={selectedTenant.id} onChange={(e) => setSelectedTenantId(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-[#30363d]">{tenants.map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.plano})</option>)}</select>
                  <button type="button" onClick={() => handleAtribuirPlanoCliente(planoMatriz)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer">Aplicar ao Cliente</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MODULOS_SISTEMA.map((mod) => {
              const liberado = planoMatriz.modulos_habilitados.includes(mod.rota);
              return (
                <div key={mod.rota} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0"><span className="text-xs font-semibold text-white block truncate">{mod.nome}</span><span className="text-[10px] text-gray-400 block truncate">{mod.descricao}</span></div>
                  <button type="button" onClick={() => alternarModuloPlano(planoMatriz, mod.rota)} className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${liberado ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {liberado ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>Liberado</span></> : <><XCircle className="w-3.5 h-3.5" /><span>Bloqueado</span></>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MasterPlanoEditModal isOpen={modalNovoAberto} planoInicial={planoEditando} onClose={() => setModalNovoAberto(false)} onCreate={criarPlano} onUpdate={atualizarPlano} />
    </div>
  );
};
