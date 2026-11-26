import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { HandCoins, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import { extrairAmortizacoesEmprestimo } from '../../../utils/emprestimoAmortizacaoHelper';
import { registrarAmortizacaoEmprestimo, estornarAmortizacaoEmprestimo } from '../../../services/emprestimoAmortizacaoService';
import type { ContaPagarItem } from '../../../types/contasPagar.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  emprestimo: ContaPagarItem | null;
  credorNome: string;
  onSuccess: () => Promise<void>;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const EmprestimoAmortizacaoModal: React.FC<Props> = ({ isOpen, onClose, emprestimo, credorNome, onSuccess }) => {
  const { contas } = useContasBancarias();
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState('DESPESA_ABATIDA');
  const [descricao, setDescricao] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [lancarSaidaCaixa, setLancarSaidaCaixa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValor(''); setDescricao(''); setErro(null);
    setData(new Date().toISOString().slice(0, 10));
    setForma('DESPESA_ABATIDA');
    setLancarSaidaCaixa(false);
    setContaBancariaId(contas[0]?.id || '');
  }, [isOpen, emprestimo?.id, contas]);

  if (!emprestimo) return null;
  const resumo = extrairAmortizacoesEmprestimo(emprestimo);

  const handleFormaChange = (novaForma: string) => {
    setForma(novaForma);
    setLancarSaidaCaixa(novaForma !== 'DESPESA_ABATIDA');
  };

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true); setErro(null);
    const res = await registrarAmortizacaoEmprestimo({
      emprestimo, valor: Number(valor) || 0, data, forma, descricao,
      contaBancariaId: lancarSaidaCaixa ? contaBancariaId : undefined,
      lancarSaidaCaixa, credorNome
    });
    setSalvando(false);
    if (!res.success) { setErro(res.error || 'Falha ao abater'); return; }
    setValor(''); setDescricao('');
    await onSuccess();
  };

  const handleEstornar = async (id: string) => {
    setSalvando(true); setErro(null);
    const res = await estornarAmortizacaoEmprestimo(emprestimo, id);
    setSalvando(false);
    if (!res.success) { setErro(res.error || 'Falha ao estornar'); return; }
    await onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Abatimentos & Parcelas — ${credorNome}`} maxWidth="2xl">
      <div className="space-y-4 text-xs text-left">
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div><span className="text-[10px] font-bold uppercase text-slate-500">Valor Original</span><p className="text-sm font-black font-mono text-slate-900">{fmt(resumo.valorOriginal)}</p></div>
          <div><span className="text-[10px] font-bold uppercase text-emerald-700">Já Devolvido</span><p className="text-sm font-black font-mono text-emerald-700">{fmt(resumo.totalAmortizado)}</p></div>
          <div><span className="text-[10px] font-bold uppercase text-amber-700">Saldo em Aberto</span><p className="text-sm font-black font-mono text-amber-700">{fmt(resumo.saldoRestante)}</p></div>
          <div className="col-span-3 pt-1">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${resumo.percentualPago}%` }} /></div>
            <span className="text-[10px] text-slate-500 font-mono">{resumo.percentualPago.toFixed(1)}% quitado • {resumo.historico.length} abatimento(s)</span>
          </div>
        </div>

        {erro && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{erro}</span></div>}

        {resumo.saldoRestante > 0.01 ? (
          <form onSubmit={handleRegistrar} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5"><HandCoins className="w-4 h-4 text-emerald-600" /> Lançar Parcela / Fração / Despesa Abatida</span>
              <button type="button" onClick={() => setValor(resumo.saldoRestante.toFixed(2))} className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">Preencher saldo total ({fmt(resumo.saldoRestante)})</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div><label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label><input type="number" step="0.01" min="0.01" max={resumo.saldoRestante} required value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex: 500,00" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900" /></div>
              <div><label className="block font-semibold text-slate-700 mb-1">Data *</label><input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900" /></div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo / Forma *</label>
                <select value={forma} onChange={(e) => handleFormaChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900">
                  <option value="DESPESA_ABATIDA">Abatimento c/ Despesa</option>
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="BOLETO">Boleto</option>
                </select>
              </div>
            </div>
            <div><label className="block font-semibold text-slate-700 mb-1">Descrição / Qual despesa ou parcela *</label><input type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Paguei conta de energia / parcela 1 via PIX / compra no mercado..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900" /></div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" checked={lancarSaidaCaixa} onChange={(e) => setLancarSaidaCaixa(e.target.checked)} className="accent-emerald-600" />
                <span>Debitar saída do Caixa/Banco</span>
              </label>
              {lancarSaidaCaixa && contas.length > 0 && (
                <select value={contaBancariaId} onChange={(e) => setContaBancariaId(e.target.value)} className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900">
                  {contas.map((c) => <option key={c.id} value={c.id}>{c.nome_conta}</option>)}
                </select>
              )}
              <button type="submit" disabled={salvando} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"><Plus className="w-4 h-4" /><span>{salvando ? 'Salvando...' : 'Abater Valor'}</span></button>
            </div>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Empréstimo 100% quitado!</div>
        )}

        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-800 uppercase text-[11px]">Histórico de Parcelas / Abatimentos ({resumo.historico.length})</h4>
          {resumo.historico.length === 0 ? (
            <p className="text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl">Nenhum abatimento parcial registrado ainda.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {resumo.historico.map((h) => (
                <div key={h.id} className="p-2.5 bg-white flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{h.descricao}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{new Date(`${h.data}T00:00:00`).toLocaleDateString('pt-BR')} • {h.forma === 'DESPESA_ABATIDA' ? 'Abatimento c/ Despesa' : h.forma}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-emerald-700">- {fmt(h.valor)}</span>
                    <button type="button" onClick={() => handleEstornar(h.id)} disabled={salvando} title="Estornar este abatimento" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
