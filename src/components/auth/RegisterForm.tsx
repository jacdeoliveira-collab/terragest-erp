import React, { useState } from 'react';
import { Building2, Mail, Lock, FileText, Phone, MapPin, AlertCircle, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { registerEmpresa, type AsaasOnboardingResult } from '../../services/authRegisterService';
import type { PlanoSaasRecord } from '../../types/planos.types';
import { TermoAdesaoPlanoBox } from '../features/planos/TermoAdesaoPlanoBox';

interface RegisterFormProps {
  planoSelecionado: PlanoSaasRecord;
  onVoltarPlanos: () => void;
  onSuccess: (requiresEmailConfirmation?: boolean, asaas?: AsaasOnboardingResult) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ planoSelecionado, onVoltarPlanos, onSuccess }) => {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO'>('PIX');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!aceitoTermos) { setError('Você precisa ler e concordar com o Contrato de Adesão, LGPD e termos de cobrança.'); return; }
    if (senha.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (senha !== confirmSenha) { setError('As senhas não coincidem.'); return; }

    setLoading(true);
    const res = await registerEmpresa({
      razaoSocial, cnpj, email, telefone, cep, endereco, numero, senha,
      planoCodigo: planoSelecionado.codigo,
      planoValor: planoSelecionado.valor_mensal,
      limiteUsuarios: planoSelecionado.limite_usuarios,
      billingType
    });
    setLoading(false);

    if (res.success) onSuccess(res.requiresEmailConfirmation, res.asaas);
    else setError(res.error || 'Falha ao realizar cadastro da empresa.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left text-xs">
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Plano Selecionado ({planoSelecionado.limite_usuarios} usuários)</span>
          <strong className="text-emerald-950 text-xs">{planoSelecionado.nome} — R$ {planoSelecionado.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</strong>
        </div>
        <button type="button" onClick={onVoltarPlanos} className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer">
          <ArrowLeft className="w-3 h-3" /><span>Trocar</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Razão Social / Empresa *</label>
          <div className="relative"><Building2 className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type="text" required placeholder="Terraplenagem Silva Ltda" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" /></div>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">CPF / CNPJ (Asaas) *</label>
          <div className="relative"><FileText className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type="text" required placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">E-mail Corporativo *</label>
          <div className="relative"><Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type="email" required placeholder="diretoria@empresa.com.br" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" /></div>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Telefone / WhatsApp *</label>
          <div className="relative"><Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type="text" required placeholder="(99) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div><label className="block font-semibold text-gray-700 mb-1">CEP *</label><input type="text" required placeholder="65400-000" value={cep} onChange={(e) => setCep(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" /></div>
        <div className="col-span-2"><label className="block font-semibold text-gray-700 mb-1">Endereço de Cobrança *</label><div className="relative"><MapPin className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type="text" required placeholder="Rua / Av., Bairro, Cidade" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" /></div></div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div><label className="block font-semibold text-gray-700 mb-1">Número</label><input type="text" placeholder="S/N" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" /></div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Cobrança Mensal (Asaas)</label>
          <select value={billingType} onChange={(e) => setBillingType(e.target.value as 'PIX' | 'BOLETO')} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold">
            <option value="PIX">PIX Mensal Recorrente</option>
            <option value="BOLETO">Boleto Bancário Mensal</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Senha (mín. 6 dígitos) *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type={showSenha ? 'text' : 'password'} required placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl" />
            <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-emerald-600">{showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Confirmar Senha *</label>
          <div className="relative"><Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input type={showSenha ? 'text' : 'password'} required placeholder="••••••••" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" /></div>
        </div>
      </div>

      <TermoAdesaoPlanoBox plano={planoSelecionado} aceito={aceitoTermos} onChangeAceito={setAceitoTermos} />

      <button type="submit" disabled={loading || !aceitoTermos} className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Criando empresa e assinatura Asaas...</span></> : <><span>Aceitar Contrato & Concluir Assinatura</span><ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
};
