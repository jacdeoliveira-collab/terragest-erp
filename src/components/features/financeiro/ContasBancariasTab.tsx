import React, { useState } from 'react';
import { Plus, Landmark, Star, Copy, Check, Pencil, Trash2, Wallet } from 'lucide-react';
import { useContasBancarias } from '../../../hooks/useContasBancarias';
import { ContaBancariaModal } from './ContaBancariaModal';
import type { ContaBancaria } from '../../../types/contaBancaria.types';

export const ContasBancariasTab: React.FC = () => {
  const { contas, isLoading, error, criarConta, atualizarConta, excluirConta } = useContasBancarias();
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEdicao, setContaEdicao] = useState<ContaBancaria | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiarPix = (chave: string, id: string) => {
    navigator.clipboard.writeText(chave);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente remover a conta "${nome}"?`)) {
      await excluirConta(id);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-base font-bold text-gray-900">Contas Bancárias & Caixas</h2>
          <p className="text-xs text-gray-500">Gestão de contas e chaves PIX para impressão em orçamentos e conciliação de caixa</p>
        </div>
        <button
          onClick={() => { setContaEdicao(null); setModalAberto(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /><span>Nova Conta / Caixa</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl">Carregando contas bancárias...</div>
      ) : contas.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-2xl space-y-2">
          <Landmark className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="font-semibold text-gray-700">Nenhuma conta bancária ou caixa cadastrado.</p>
          <p className="text-gray-400">Cadastre uma conta corrente ou chave PIX para que apareça automaticamente nos Orçamentos e no Faturamento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contas.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.tipo_conta === 'CAIXA_FISICO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {c.tipo_conta === 'CAIXA_FISICO' ? <Wallet className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{c.nome_conta}</h4>
                    <span className="text-[10px] text-gray-500">{c.banco} • {c.tipo_conta.replace('_', ' ')}</span>
                  </div>
                </div>
                {c.is_padrao && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[9px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> Padrão
                  </span>
                )}
              </div>

              {(c.agencia || c.numero_conta) && (
                <div className="p-2 bg-gray-50 rounded-xl text-[11px] text-gray-600 flex justify-between">
                  <span>Ag: <b>{c.agencia || '—'}</b></span>
                  <span>Conta: <b>{c.numero_conta || '—'}</b></span>
                </div>
              )}

              {c.chave_pix ? (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase block">Chave PIX ({c.tipo_chave_pix || 'Chave'})</span>
                    <span className="font-mono text-[11px] font-bold text-emerald-950 truncate block">{c.chave_pix}</span>
                  </div>
                  <button
                    onClick={() => copiarPix(c.chave_pix!, c.id)}
                    title="Copiar Chave PIX"
                    className="p-1.5 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg cursor-pointer shrink-0 transition-colors"
                  >
                    {copiadoId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded-xl text-[10px] text-gray-400 italic">Sem chave PIX cadastrada</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { setContaEdicao(c); setModalAberto(true); }}
                  className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /><span>Editar</span>
                </button>
                <button
                  onClick={() => handleExcluir(c.id, c.nome_conta)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /><span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContaBancariaModal
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); setContaEdicao(null); }}
        contaParaEditar={contaEdicao}
        onSalvar={criarConta}
        onAtualizar={atualizarConta}
      />
    </div>
  );
};
