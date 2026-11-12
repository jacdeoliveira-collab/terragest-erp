import React, { useState, useEffect } from 'react';
import { Plus, Check, Camera, X, Tag, RotateCcw } from 'lucide-react';
import { useFormaContaSync } from '../../../../hooks/useFormaContaSync';
import { comprimirImagem, salvarComprovante } from '../../../../services/comprovanteStorageService';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { notificarFalhaDrive } from '../../../../utils/driveFeedback';
import type { AdiantamentoItem } from '../../../../types/servicoHorimetro.types';

interface Props {
  onAdicionar: (item: Omit<AdiantamentoItem, 'id'>) => Promise<void> | void;
  itemEmEdicao?: AdiantamentoItem | null;
  onSalvarEdicao?: (id: string, item: Omit<AdiantamentoItem, 'id'>) => Promise<void> | void;
  onCancelarEdicao?: () => void;
  isFirst: boolean;
}

export const AdiantamentoFormInput: React.FC<Props> = ({
  onAdicionar, itemEmEdicao, onSalvarEdicao, onCancelarEdicao, isFirst
}) => {
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState('PIX');
  const [contaId, setContaId] = useState('');
  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaId, setForma, setContaId, 'Dinheiro');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState('');
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  useEffect(() => {
    if (itemEmEdicao) {
      setValor(itemEmEdicao.valor ? String(itemEmEdicao.valor) : '');
      setForma(itemEmEdicao.forma_pagamento || 'PIX');
      setContaId(itemEmEdicao.conta_bancaria_id || '');
      setData(itemEmEdicao.data || new Date().toISOString().slice(0, 10));
      setObs(itemEmEdicao.observacao || '');
      setComprovante(itemEmEdicao.comprovante_url);
    } else {
      setValor(''); setObs(''); setComprovante(undefined);
      if (!contaId && contaPadrao?.id) setContaId(contaPadrao.id);
    }
  }, [itemEmEdicao, contaPadrao]);

  const isDesconto = forma === 'DESCONTO';

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCarregandoFoto(true);
      const upDrive = await uploadParaGoogleDrive(file, 'frota');
      if (upDrive.sucesso && upDrive.driveUrl) { setComprovante(upDrive.driveUrl); }
      else {
        const chave = `idb://adiant_${Date.now()}`;
        const b64 = await comprimirImagem(file);
        await salvarComprovante(chave, b64);
        setComprovante(chave);
        notificarFalhaDrive(upDrive.erro, true);
      }
    } finally { setCarregandoFoto(false); }
  };

  const handleSubmit = async () => {
    const v = parseFloat(valor);
    if (!v || v <= 0) return;
    const defaultObs = isDesconto ? 'Desconto Comercial / Acordo' : (isFirst ? 'Sinal / Entrada' : 'Parcela / A Haver');
    const payload = {
      valor: v, forma_pagamento: forma,
      conta_bancaria_id: isDesconto ? undefined : (contaId || undefined),
      data: data || new Date().toISOString().slice(0, 10),
      observacao: obs.trim() || defaultObs,
      comprovante_url: isDesconto ? undefined : comprovante
    };
    if (itemEmEdicao && onSalvarEdicao) {
      await onSalvarEdicao(itemEmEdicao.id, payload);
    } else {
      await onAdicionar(payload);
    }
    setValor(''); setObs(''); setComprovante(undefined);
  };

  return (
    <div className={`p-2.5 border rounded-lg space-y-2 text-xs transition-colors ${itemEmEdicao ? 'bg-amber-50/70 border-amber-400' : isDesconto ? 'border-amber-300 bg-amber-50/20' : 'bg-white border-emerald-200'}`}>
      {itemEmEdicao && (
        <div className="flex items-center justify-between pb-1 border-b border-amber-200 text-amber-900 font-bold text-[11px]">
          <span>✏️ Editando: {itemEmEdicao.observacao || 'Recebimento / Parcela'}</span>
          <button type="button" onClick={onCancelarEdicao} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer">
            <RotateCcw className="w-3 h-3" /> Cancelar
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">{isDesconto ? 'Valor do Desconto (R$) *' : 'Valor (R$) *'}</label>
          <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" className={`w-full px-2 py-1 bg-gray-50 border rounded-lg font-mono font-bold ${isDesconto ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-emerald-700'}`} />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Tipo / Forma</label>
          <select value={forma} onChange={(e) => onFormaChange(e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg">
            <option value="PIX">PIX</option><option value="Dinheiro">Dinheiro</option><option value="Transferência">Transferência</option><option value="Boleto">Boleto</option><option value="Cartão">Cartão</option><option value="DESCONTO">🏷️ Desconto / Abatimento</option>
          </select>
        </div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Data</label><input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" /></div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Identificação / Motivo</label><input type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder={isDesconto ? 'Ex: Desconto' : 'Ex: 2ª Parcela'} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" /></div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {!isDesconto && <select value={contaId} onChange={(e) => onContaChange(e.target.value)} title="Banco / Caixa" className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-[11px] max-w-full sm:max-w-[190px]">{contas.map((c) => <option key={c.id} value={c.id}>{c.nome_conta}</option>)}</select>}
          {!isDesconto && (
            <div className="flex items-center gap-1.5">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-gray-300 hover:border-emerald-500 rounded-lg cursor-pointer text-[11px] text-gray-600 bg-gray-50">
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{carregandoFoto ? 'Processando...' : comprovante ? 'Comprovante Anexado ✓' : 'Anexar Comprovante'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={handleFoto} className="hidden" />
              </label>
              {comprovante && <button type="button" onClick={() => setComprovante(undefined)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><X className="w-3.5 h-3.5" /></button>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {itemEmEdicao && <button type="button" onClick={onCancelarEdicao} className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold">Cancelar</button>}
          <button type="button" onClick={handleSubmit} className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 font-bold rounded-lg shadow-xs cursor-pointer text-xs text-white shrink-0 ${itemEmEdicao ? 'bg-amber-600 hover:bg-amber-700' : isDesconto ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {itemEmEdicao ? <Check className="w-3.5 h-3.5" /> : isDesconto ? <Tag className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{itemEmEdicao ? 'Salvar Edição' : isDesconto ? 'Conceder Desconto' : 'Gravar Pagamento'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
