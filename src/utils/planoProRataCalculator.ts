import type { PlanoSaasRecord } from '../types/planos.types';

export interface TenantAssinaturaRef {
  plano?: string | null;
  plano_valor?: number | null;
  assinatura_fim?: string | null;
}

export interface CalculoMudancaPlano {
  tipoMudanca: 'NOVA_ASSINATURA' | 'UPGRADE' | 'DOWNGRADE' | 'RENOVACAO';
  planoAtualCodigo: string;
  planoAtualNome: string;
  valorPlanoAtual: number;
  valorPlanoNovo: number;
  diasRestantesAtuais: number;
  creditoProporcionalAtual: number;
  custoProporcionalNovo: number;
  diferencaSuprirUpgrade: number;
  creditoRetornoDowngrade: number;
  diasExtrasConvertidos: number;
  diasAcessoTotalNovo: number;
  valorCobrarAgora: number;
  resumoExplicativo: string;
}

export function calcularProRataMudancaPlano(
  tenant: TenantAssinaturaRef | null | undefined,
  planoNovo: PlanoSaasRecord,
  todosPlanos: PlanoSaasRecord[]
): CalculoMudancaPlano {
  const codigoAtual = (tenant?.plano || 'GRATIS').toUpperCase();
  const planoAtualObj = todosPlanos.find((p) => p.codigo.toUpperCase() === codigoAtual);
  const valorAtual = planoAtualObj ? Number(planoAtualObj.valor_mensal) : Number(tenant?.plano_valor || 0);
  const nomeAtual = planoAtualObj?.nome || codigoAtual;
  const valorNovo = Number(planoNovo.valor_mensal || 0);

  let diasRestantes = 0;
  if (tenant && codigoAtual !== 'GRATIS' && valorAtual > 0) {
    const hoje = new Date();
    const fimStr = tenant.assinatura_fim;
    if (fimStr) {
      const fim = new Date(`${fimStr}T23:59:59`);
      const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      diasRestantes = diff > 0 && diff <= 365 ? diff : 0;
    }
  }

  const diariaAtual = valorAtual / 30;
  const diariaNova = valorNovo / 30;
  const creditoAtual = Number((diariaAtual * diasRestantes).toFixed(2));
  const custoNovo = Number((diariaNova * diasRestantes).toFixed(2));

  if (diasRestantes <= 0 || valorAtual <= 0 || codigoAtual === 'GRATIS') {
    return {
      tipoMudanca: 'NOVA_ASSINATURA',
      planoAtualCodigo: codigoAtual,
      planoAtualNome: nomeAtual,
      valorPlanoAtual: valorAtual,
      valorPlanoNovo: valorNovo,
      diasRestantesAtuais: 0,
      creditoProporcionalAtual: 0,
      custoProporcionalNovo: valorNovo,
      diferencaSuprirUpgrade: 0,
      creditoRetornoDowngrade: 0,
      diasExtrasConvertidos: 0,
      diasAcessoTotalNovo: 30,
      valorCobrarAgora: valorNovo,
      resumoExplicativo: `Ciclo integral de 30 dias no ${planoNovo.nome} por R$ ${valorNovo.toFixed(2)}/mês.`
    };
  }

  if (valorNovo > valorAtual) {
    const diferenca = Number(Math.max(5, custoNovo - creditoAtual).toFixed(2));
    return {
      tipoMudanca: 'UPGRADE',
      planoAtualCodigo: codigoAtual,
      planoAtualNome: nomeAtual,
      valorPlanoAtual: valorAtual,
      valorPlanoNovo: valorNovo,
      diasRestantesAtuais: diasRestantes,
      creditoProporcionalAtual: creditoAtual,
      custoProporcionalNovo: custoNovo,
      diferencaSuprirUpgrade: diferenca,
      creditoRetornoDowngrade: 0,
      diasExtrasConvertidos: 0,
      diasAcessoTotalNovo: diasRestantes,
      valorCobrarAgora: diferenca,
      resumoExplicativo: `Upgrade proporcional (${diasRestantes} dias restantes): crédito de R$ ${creditoAtual.toFixed(2)} do ${nomeAtual}. Valor a suprir agora: R$ ${diferenca.toFixed(2)}.`
    };
  }

  if (valorNovo < valorAtual) {
    const sobra = Number(Math.max(0, creditoAtual - custoNovo).toFixed(2));
    const diasExtras = diariaNova > 0 ? Math.round(sobra / diariaNova) : 0;
    const valorProximaComAbatimento = Number(Math.max(5, valorNovo - sobra).toFixed(2));
    return {
      tipoMudanca: 'DOWNGRADE',
      planoAtualCodigo: codigoAtual,
      planoAtualNome: nomeAtual,
      valorPlanoAtual: valorAtual,
      valorPlanoNovo: valorNovo,
      diasRestantesAtuais: diasRestantes,
      creditoProporcionalAtual: creditoAtual,
      custoProporcionalNovo: custoNovo,
      diferencaSuprirUpgrade: 0,
      creditoRetornoDowngrade: sobra,
      diasExtrasConvertidos: diasExtras,
      diasAcessoTotalNovo: 30 + diasExtras,
      valorCobrarAgora: valorProximaComAbatimento,
      resumoExplicativo: `Redução de plano (${diasRestantes} dias restantes): crédito excedente de R$ ${sobra.toFixed(2)} (+${diasExtras} dias de acesso ou desconto na fatura para R$ ${valorProximaComAbatimento.toFixed(2)}).`
    };
  }

  return {
    tipoMudanca: 'RENOVACAO',
    planoAtualCodigo: codigoAtual,
    planoAtualNome: nomeAtual,
    valorPlanoAtual: valorAtual,
    valorPlanoNovo: valorNovo,
    diasRestantesAtuais: diasRestantes,
    creditoProporcionalAtual: creditoAtual,
    custoProporcionalNovo: valorNovo,
    diferencaSuprirUpgrade: 0,
    creditoRetornoDowngrade: 0,
    diasExtrasConvertidos: 0,
    diasAcessoTotalNovo: diasRestantes + 30,
    valorCobrarAgora: valorNovo,
    resumoExplicativo: `Renovação mensal (+30 dias adicionados aos ${diasRestantes} dias atuais = ${diasRestantes + 30} dias de acesso).`
  };
}
