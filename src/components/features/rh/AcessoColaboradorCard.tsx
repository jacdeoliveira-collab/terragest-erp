import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { convidarColaborador } from '../../../services/rhAuthService';
import type { Funcionario, StatusConviteAcesso } from '../../../types/rh.types';

interface AcessoColaboradorCardProps {
  funcionario: Funcionario;
  onUpdateStatus?: (novoStatus: StatusConviteAcesso, email: string) => void;
}

export const AcessoColaboradorCard: React.FC<AcessoColaboradorCardProps> = ({
  funcionario,
  onUpdateStatus
}) => {
  const [emailAcesso, setEmailAcesso] = useState(funcionario.email_acesso || '');
  const [pinAssinatura, setPinAssinatura] = useState(funcionario.pin_assinatura || '');
  const [statusConvite, setStatusConvite] = useState<StatusConviteAcesso>(
    funcionario.status_convite || 'NAO_CONVIDADO'
  );
  const [enviando, setEnviando] = useState(false);
  const [salvandoPin, setSalvandoPin] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [msgPin, setMsgPin] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const handleSalvarPin = async () => {
    if (pinAssinatura.length !== 4) return;
    try {
      setSalvandoPin(true);
      setMsgPin(null);
      const { supabase } = await import('../../../lib/supabase');
      const { error } = await supabase
        .from('rh_funcionarios')
        .update({ pin_assinatura: pinAssinatura, updated_at: new Date().toISOString() })
        .eq('id', funcionario.id);
      if (error) throw new Error(error.message);
      setMsgPin({ tipo: 'ok', texto: 'PIN gravado!' });
    } catch (e: any) {
      setMsgPin({ tipo: 'erro', texto: e.message || 'Erro ao gravar PIN' });
    } finally {
      setSalvandoPin(false);
    }
  };

  const handleEnviarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAcesso.trim()) return;
    setEnviando(true);
    setMsgFeedback(null);
    const res = await convidarColaborador({
      funcionarioId: funcionario.id, email: emailAcesso, nome: funcionario.nome
    });
    setEnviando(false);
    if (res.success) {
      setStatusConvite('PENDENTE');
      if (onUpdateStatus) onUpdateStatus('PENDENTE', emailAcesso.trim());
      setMsgFeedback({ tipo: 'ok', texto: res.message || 'Convite enviado!' });
    } else {
      setMsgFeedback({ tipo: 'erro', texto: res.error || 'Erro ao enviar convite' });
    }
  };

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          Acesso ao Sistema (Login do Colaborador)
        </span>

        {statusConvite === 'ATIVO' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Acesso Ativo
          </span>
        ) : statusConvite === 'PENDENTE' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Convite Pendente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <ShieldAlert className="w-3 h-3 text-gray-400" />
            Não Convidado
          </span>
        )}
      </div>

      <form onSubmit={handleEnviarConvite} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="operador@construtora.com.br"
            value={emailAcesso}
            onChange={(e) => setEmailAcesso(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={enviando || !emailAcesso.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>{enviando ? 'Enviando...' : statusConvite === 'PENDENTE' ? 'Reenviar Convite' : 'Enviar Convite'}</span>
          </button>
        </div>

        {msgFeedback && (
          <p className={`text-[11px] font-medium ${msgFeedback.tipo === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`}>
            {msgFeedback.texto}
          </p>
        )}
      </form>

      {/* Gestão do PIN de 4 Dígitos */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-[11px] font-bold text-gray-700 mb-1">
          PIN de Assinatura no Campo (4 Dígitos)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="password"
            maxLength={4}
            pattern="\d{4}"
            placeholder="Ex: 1234"
            value={pinAssinatura}
            onChange={(e) => setPinAssinatura(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-mono tracking-widest text-center focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <button
            type="button"
            disabled={salvandoPin || pinAssinatura.length !== 4}
            onClick={handleSalvarPin}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {salvandoPin ? 'Gravando...' : 'Salvar PIN'}
          </button>
          {msgPin && (
            <span className={`text-[10px] font-medium ${msgPin.tipo === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {msgPin.texto}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
