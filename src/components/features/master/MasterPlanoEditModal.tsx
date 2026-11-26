import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { MODULOS_SISTEMA, type PlanoSaasRecord, type CreatePlanoSaasDTO, type UpdatePlanoSaasDTO } from '../../../types/planos.types';

interface Props {
  isOpen: boolean;
  planoInicial?: PlanoSaasRecord | null;
  onClose: () => void;
  onCreate: (dto: CreatePlanoSaasDTO) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, dto: UpdatePlanoSaasDTO) => Promise<{ success: boolean; error?: string }>;
}

export const MasterPlanoEditModal: React.FC<Props> = ({
  isOpen, planoInicial, onClose, onCreate, onUpdate
}) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorMensal, setValorMensal] = useState('299');
  const [limiteUsuarios, setLimiteUsuarios] = useState('5');
  const [ordem, setOrdem] = useState('1');
  const [termoTitulo, setTermoTitulo] = useState('');
  const [termoAceiteTexto, setTermoAceiteTexto] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [destaque, setDestaque] = useState(false);
  const [sincronizarAsaas, setSincronizarAsaas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErro(null); setSincronizarAsaas(true);
    if (planoInicial) {
      setCodigo(planoInicial.codigo); setNome(planoInicial.nome);
      setDescricao(planoInicial.descricao || ''); setValorMensal(String(planoInicial.valor_mensal));
      setLimiteUsuarios(String(planoInicial.limite_usuarios)); setOrdem(String(planoInicial.ordem || 1));
      setTermoTitulo(planoInicial.termo_titulo || ''); setTermoAceiteTexto(planoInicial.termo_aceite_texto || '');
      setAtivo(planoInicial.ativo); setDestaque(planoInicial.destaque);
    } else {
      setCodigo(''); setNome(''); setDescricao(''); setValorMensal('299');
      setLimiteUsuarios('5'); setOrdem('4'); setTermoTitulo(''); setTermoAceiteTexto('');
      setAtivo(true); setDestaque(false);
    }
  }, [isOpen, planoInicial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true); setErro(null);
    try {
      const precoNum = Math.max(0, Number(valorMensal) || 0);
      const limNum = Math.max(1, Number(limiteUsuarios) || 5);
      const codClean = codigo.trim().toUpperCase().replace(/\s+/g, '_');
      const baseDto = {
        codigo: codClean, nome: nome.trim(), descricao: descricao.trim(), valor_mensal: precoNum,
        limite_usuarios: limNum, ordem: Number(ordem) || 1, ativo, destaque,
        termo_titulo: termoTitulo.trim() || null, termo_aceite_texto: termoAceiteTexto.trim() || null
      };
      const res = planoInicial
        ? await onUpdate(planoInicial.id, baseDto)
        : await onCreate({ ...baseDto, modulos_habilitados: MODULOS_SISTEMA.slice(0, 6).map((m) => m.rota) });
      if (!res.success) { setErro(res.error || 'Falha ao salvar plano.'); return; }
      if (planoInicial && sincronizarAsaas) {
        await fetch('/api/saas-checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sincronizar_preco_plano', codigoPlano: codClean, novoValor: precoNum, novoLimiteUsuarios: limNum })
        }).catch(() => {});
      }
      onClose();
    } finally { setSalvando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#11161d] border border-[#30363d] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl text-left text-xs">
        <div className="p-4 px-5 border-b border-[#21262d] flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">{planoInicial ? `Editar Plano: ${planoInicial.nome}` : 'Novo Plano Comercial'}</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {erro && <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{erro}</span></div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-gray-300 font-semibold mb-1">Código / Slug *</label><input type="text" required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="EX: BASICO" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl font-mono" /></div>
            <div><label className="block text-gray-300 font-semibold mb-1">Nome do Plano *</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Plano Básico" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl" /></div>
          </div>
          <div><label className="block text-gray-300 font-semibold mb-1">Descrição Comercial</label><textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição comercial exibida no cadastro e planos..." className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl" /></div>
          <div className="grid grid-cols-3 gap-2.5">
            <div><label className="block text-gray-300 font-semibold mb-1">Valor Mensal (R$) *</label><input type="number" step="0.01" min="0" required value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl font-mono" /></div>
            <div><label className="block text-gray-300 font-semibold mb-1">Máx. Usuários *</label><input type="number" min="1" required value={limiteUsuarios} onChange={(e) => setLimiteUsuarios(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl font-mono" /></div>
            <div><label className="block text-gray-300 font-semibold mb-1">Ordem Exibição</label><input type="number" min="0" value={ordem} onChange={(e) => setOrdem(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] text-white rounded-xl font-mono" /></div>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] space-y-2">
            <span className="block text-[11px] font-bold text-amber-400">Caixa de Confirmação (exigida ao assinar / trocar de plano)</span>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Título da Caixa (opcional)</label>
              <input type="text" value={termoTitulo} onChange={(e) => setTermoTitulo(e.target.value)} placeholder="Ex: Contrato de Adesão, LGPD & Escopo" className="w-full px-3 py-1.5 bg-[#11161d] border border-[#30363d] text-white rounded-lg" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Texto do Aceite Obrigatório (deixe vazio para usar o padrão)</label>
              <textarea rows={3} value={termoAceiteTexto} onChange={(e) => setTermoAceiteTexto(e.target.value)} placeholder="Li e concordo com o Contrato de Adesão, cobrança mensal recorrente, suspensão por inadimplência e LGPD..." className="w-full px-3 py-1.5 bg-[#11161d] border border-[#30363d] text-white rounded-lg" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer"><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="accent-emerald-500" /><span>Plano Ativo</span></label>
            <label className="flex items-center gap-2 text-amber-300 cursor-pointer"><input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} className="accent-amber-500" /><span>Badge "Mais Escolhido"</span></label>
          </div>
          {planoInicial && (
            <label className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 cursor-pointer">
              <input type="checkbox" checked={sincronizarAsaas} onChange={(e) => setSincronizarAsaas(e.target.checked)} className="mt-0.5 accent-emerald-500" />
              <span className="text-[11px] leading-snug flex items-center gap-1"><RefreshCw className="w-3 h-3 shrink-0" /> Sincronizar reajuste de valor e limite de usuários nas assinaturas recorrentes ativas no Asaas</span>
            </label>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#21262d]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-semibold cursor-pointer">Cancelar</button>
            <button type="submit" disabled={salvando} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl cursor-pointer disabled:opacity-50"><Save className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Salvar Plano'}</span></button>
          </div>
        </form>
      </div>
    </div>
  );
};
