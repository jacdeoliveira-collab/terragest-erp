import React from 'react';
import { Check, Lock, Users, Scale, Repeat, AlertTriangle, Gavel, Building2 } from 'lucide-react';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../../../types/planos.types';

interface Props {
  plano: PlanoSaasRecord;
  dark?: boolean;
}

export const TermoAdesaoClausulas: React.FC<Props> = ({ plano, dark = false }) => {
  const modulosInclusos = MODULOS_SISTEMA.filter((m) => plano.modulos_habilitados.includes(m.rota));
  const modulosBloqueados = MODULOS_SISTEMA.filter((m) => !plano.modulos_habilitados.includes(m.rota));
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`max-h-56 overflow-y-auto rounded-lg border p-3 space-y-2.5 text-[10px] leading-relaxed ${dark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
      <div className="pb-2 border-b border-emerald-500/20 flex items-center justify-between flex-wrap gap-1">
        <span className="font-bold text-emerald-500 flex items-center gap-1">
          <Building2 className="w-3 h-3" /> CONTRATADA / DETENTORA DO SOFTWARE:
        </span>
        <strong className={dark ? 'text-white' : 'text-slate-900'}>JAC de Oliveira / TerraGest — Codó/MA</strong>
      </div>

      <div>
        <p className="font-bold text-emerald-500 flex items-center gap-1">
          <Users className="w-3 h-3" /> 1. PLANO CONTRATADO E LIMITE DE USUÁRIOS
        </p>
        <p>
          A CONTRATANTE adere ao <strong>{plano.nome} ({plano.codigo})</strong> pelo valor mensal recorrente de{' '}
          <strong>{fmt(plano.valor_mensal)}/mês</strong>, com direito de acesso e execução de dados para até{' '}
          <strong>{plano.limite_usuarios} usuários simultâneos/cadastrados</strong> vinculados à empresa.
        </p>
      </div>

      <div>
        <p className="font-bold text-emerald-500">2. FUNCIONALIDADES VIVAS HABILITADAS ({modulosInclusos.length} de {MODULOS_SISTEMA.length} módulos)</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
          {modulosInclusos.map((m) => (
            <li key={m.rota} className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
              <span><strong>{m.nome}:</strong> {m.descricao}</span>
            </li>
          ))}
        </ul>
        {modulosBloqueados.length > 0 && (
          <p className="mt-1 text-amber-500 flex items-center gap-1 flex-wrap">
            <Lock className="w-3 h-3 shrink-0" />
            <span>Não inclusos neste pacote: {modulosBloqueados.map((m) => m.nome).join(', ')}.</span>
          </p>
        )}
      </div>

      <div>
        <p className="font-bold text-emerald-500 flex items-center gap-1">
          <Scale className="w-3 h-3" /> 3. PROTEÇÃO DE DADOS (LGPD — CONTROLADOR VS. OPERADOR)
        </p>
        <p>
          Nos termos do Art. 5º, VI e VII, da Lei nº 13.709/2018 (LGPD), a empresa <strong>CONTRATANTE atua expressamente como CONTROLADORA</strong> dos dados pessoais e operacionais de seus colaboradores, clientes e operações inseridos na plataforma, enquanto o <strong>TerraGest (JAC de Oliveira / TerraGest) atua exclusivamente como OPERADOR tecnológico</strong>, processando os registros em ambiente <em>multitenant</em> isolado por Row Level Security (RLS).
        </p>
      </div>

      <div>
        <p className="font-bold text-emerald-500 flex items-center gap-1">
          <Repeat className="w-3 h-3" /> 4. COBRANÇA RECORRENTE MENSAL E MUDANÇA DE PLANO (PRO-RATA)
        </p>
        <p>
          A assinatura possui renovação mensal automática via Asaas. Em caso de <strong>Upgrade</strong> (mudança para plano maior), o sistema calcula os dias restantes do ciclo atual e cobra a diferença proporcional a suprir, reajustando os ciclos seguintes. Em caso de <strong>Downgrade</strong> (mudança para plano menor), o saldo proporcional dos dias restantes é convertido em crédito e dias adicionais de acesso.
        </p>
      </div>

      <div>
        <p className="font-bold text-emerald-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> 5. CANCELAMENTO, INADIMPLÊNCIA E RETENÇÃO DE DADOS
        </p>
        <p>
          O cancelamento pode ser solicitado sem multa antes da próxima renovação, mantendo-se o acesso até o fim do ciclo já pago. Ocorrerá <strong>suspensão automática do acesso após 5 (cinco) dias de inadimplência</strong> e <strong>exclusão definitiva dos dados após 30 (trinta) dias de inatividade por falta de pagamento</strong>, cabendo exclusivamente à CONTRATANTE a exportação prévia de seus relatórios e documentos.
        </p>
      </div>

      <div>
        <p className="font-bold text-emerald-500 flex items-center gap-1">
          <Gavel className="w-3 h-3" /> 6. LIMITAÇÃO DE RESPONSABILIDADE E FORO
        </p>
        <p>
          O TerraGest constitui ferramenta tecnológica de apoio à gestão operacional, não se responsabilizando por prejuízos decorrentes de lançamentos operacionais incorretos efetuados pelos usuários ou falhas de conexão externa. Fica eleito o <strong>Foro da Comarca de Codó/MA</strong> para dirimir quaisquer controvérsias oriundas deste termo.
        </p>
      </div>
    </div>
  );
};
