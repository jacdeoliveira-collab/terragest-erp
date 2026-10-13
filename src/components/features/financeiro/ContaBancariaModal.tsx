import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import type { ContaBancaria, CreateContaBancariaDTO, TipoContaBancaria, TipoChavePix } from '../../../types/contaBancaria.types';

interface ContaBancariaModalProps {
  isOpen: boolean;
  onClose: () => void;
  contaParaEditar?: ContaBancaria | null;
  onSalvar: (dto: CreateContaBancariaDTO) => Promise<{ success: boolean; error?: string }>;
  onAtualizar?: (id: string, dto: Partial<CreateContaBancariaDTO>) => Promise<{ success: boolean; error?: string }>;
}

export const ContaBancariaModal: React.FC<ContaBancariaModalProps> = ({
  isOpen, onClose, contaParaEditar, onSalvar, onAtualizar
}) => {
  const [nomeConta, setNomeConta] = useState('');
  const [banco, setBanco] = useState('Banco do Brasil');
  const [tipoConta, setTipoConta] = useState<TipoContaBancaria>('CORRENTE');
  const [agencia, setAgencia] = useState('');
  const [numeroConta, setNumeroConta] = useState('');
  const [titular, setTitular] = useState('');
  const [documentoTitular, setDocumentoTitular] = useState('');
  const [tipoChavePix, setTipoChavePix] = useState<TipoChavePix>('CNPJ');
  const [chavePix, setChavePix] = useState('');
  const [isPadrao, setIsPadrao] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contaParaEditar) {
      setNomeConta(contaParaEditar.nome_conta || '');
      setBanco(contaParaEditar.banco || 'Banco do Brasil');
      setTipoConta(contaParaEditar.tipo_conta || 'CORRENTE');
      setAgencia(contaParaEditar.agencia || '');
      setNumeroConta(contaParaEditar.numero_conta || '');
      setTitular(contaParaEditar.titular || '');
      setDocumentoTitular(contaParaEditar.documento_titular || '');
      setTipoChavePix(contaParaEditar.tipo_chave_pix || 'CNPJ');
      setChavePix(contaParaEditar.chave_pix || '');
      setIsPadrao(Boolean(contaParaEditar.is_padrao));
    } else {
      setNomeConta(''); setBanco('Banco do Brasil'); setTipoConta('CORRENTE');
      setAgencia(''); setNumeroConta(''); setTitular(''); setDocumentoTitular('');
      setTipoChavePix('CNPJ'); setChavePix(''); setIsPadrao(false);
    }
  }, [contaParaEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const payload: CreateContaBancariaDTO = {
      nome_conta: nomeConta.trim(), banco, tipo_conta: tipoConta,
      agencia: agencia.trim() || undefined, numero_conta: numeroConta.trim() || undefined,
      titular: titular.trim() || undefined, documento_titular: documentoTitular.trim() || undefined,
      tipo_chave_pix: tipoChavePix, chave_pix: chavePix.trim() || undefined,
      is_padrao: isPadrao, ativo: true
    };
    const res = contaParaEditar && onAtualizar
      ? await onAtualizar(contaParaEditar.id, payload)
      : await onSalvar(payload);
    setIsSubmitting(false);
    if (res.success) onClose();
    else setError(res.error || 'Falha ao salvar conta bancária');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={contaParaEditar ? 'Editar Conta / Chave Pix' : 'Nova Conta Bancária / Caixa'}>
      <form onSubmit={handleSubmit} className="text-left space-y-3.5 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Identificação / Apelido da Conta *</label>
            <input type="text" required placeholder="Ex: Banco do Brasil - Conta Principal" value={nomeConta} onChange={(e) => setNomeConta(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Instituição Bancária *</label>
            <input type="text" required placeholder="Ex: Banco do Brasil, Itaú, Caixa Físico" value={banco} onChange={(e) => setBanco(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tipo da Conta *</label>
            <select value={tipoConta} onChange={(e) => setTipoConta(e.target.value as TipoContaBancaria)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium">
              <option value="CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Conta Poupança</option>
              <option value="CAIXA_FISICO">Caixa Físico / Dinheiro</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Agência</label>
            <input type="text" placeholder="Ex: 1234-5" value={agencia} onChange={(e) => setAgencia(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Número da Conta</label>
            <input type="text" placeholder="Ex: 98765-4" value={numeroConta} onChange={(e) => setNumeroConta(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Titular da Conta</label>
            <input type="text" placeholder="Razão Social ou Nome do Titular" value={titular} onChange={(e) => setTitular(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">CPF ou CNPJ do Titular</label>
            <input type="text" placeholder="00.000.000/0001-00" value={documentoTitular} onChange={(e) => setDocumentoTitular(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
        </div>

        {/* Bloco Pix */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
          <span className="font-bold text-emerald-900 block">Chave PIX (Para envio em Orçamentos e Faturamento)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-emerald-800 mb-1">Tipo de Chave</label>
              <select value={tipoChavePix} onChange={(e) => setTipoChavePix(e.target.value as TipoChavePix)} className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold">
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
                <option value="EMAIL">E-mail</option>
                <option value="TELEFONE">Telefone</option>
                <option value="ALEATORIA">Chave Aleatória</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-emerald-800 mb-1">Chave PIX</label>
              <input type="text" placeholder="Cole aqui a chave PIX exata" value={chavePix} onChange={(e) => setChavePix(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono text-emerald-950" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input type="checkbox" id="chkPadrao" checked={isPadrao} onChange={(e) => setIsPadrao(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
          <label htmlFor="chkPadrao" className="text-gray-700 font-semibold cursor-pointer">
            Definir como Conta e Chave Pix padrão (sugerida automaticamente nos Orçamentos)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm cursor-pointer">
            <Save className="w-4 h-4" /><span>{isSubmitting ? 'Salvando...' : 'Salvar Conta'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
