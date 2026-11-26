import type { PlanoSaasRecord } from '../types/planos.types';

export interface TenantAssinaturaRef {
  plano?: string | null;
  plano_valor?: number | null;
  valor_mensalidade?: number | null;
  assinatura_fim?: string | null;
}

export interface CalculoMudancaPlano {
  tipoMudanca: 'NOVA_ASSINATURA' | 'UPGRADE' | 'DOWNGRADE' | 'RENOVACAO' | 'ATRASADO';
  estaAtrasado: boolean;
  diasAtraso: number;
  precisaPagamentoImediato: boolean;
  planoAtualCodigo: string;
  planoAtualNome: string;
  valorPlanoAtual: number;
  valorPlanoNovo: number;
  diasRestantesAtuais: number;
  creditoProporcionalAtual: number;
  diasConvertidosNovoPlano: number;
  diasAcessoTotalNovo: number;
  novaDataVencimento: string;
  novaDataVencimentoBr: string;
  valorCobrarAgora: number;
  resumoExplicativo: string;
}

function addDiasIso(dias: number): { iso: string; br: string } {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(1, dias));
  const iso = d.toISOString().slice(0, 10);
  return { iso, br: iso.split('-').reverse().join('/') };
}

export function calcularProRataMudancaPlano(
  tenant: TenantAssinaturaRef | null | undefined,
  planoNovo: PlanoSaasRecord,
  todosPlanos: PlanoSaasRecord[]
): CalculoMudancaPlano {
  const codigoAtual = (tenant?.plano || 'GRATIS').toUpperCase();
  const planoAtualObj = todosPlanos.find((p) => p.codigo.toUpperCase() === codigoAtual);
  const valorAtual = planoAtualObj
    ? Number(planoAtualObj.valor_mensal)
    : Number(tenant?.plano_valor || tenant?.valor_mensalidade || 0);
  const nomeAtual = planoAtualObj?.nome || codigoAtual;
  const valorNovo = Number(planoNovo.valor_mensal || 0);

  let diasRestantes = 0;
  let diasAtraso = 0;
  if (tenant?.assinatura_fim) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fim = new Date(`${tenant.assinatura_fim}T00:00:00`);
    const diff = Math.round((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) diasRestantes = Math.min(365, diff);
    else if (diff < 0) diasAtraso = Math.abs(diff);
  }

  const venc30 = addDiasIso(30);

  // 1. Em atraso: obriga pagamento imediato
  if (diasAtraso > 0) {
    return {
      tipoMudanca: 'ATRASADO', estaAtrasado: true, diasAtraso, precisaPagamentoImediato: true,
      planoAtualCodigo: codigoAtual, planoAtualNome: nomeAtual, valorPlanoAtual: valorAtual, valorPlanoNovo: valorNovo,
      diasRestantesAtuais: 0, creditoProporcionalAtual: 0, diasConvertidosNovoPlano: 30,
      diasAcessoTotalNovo: 30, novaDataVencimento: venc30.iso, novaDataVencimentoBr: venc30.br,
      valorCobrarAgora: valorNovo,
      resumoExplicativo: `Assinatura vencida há ${diasAtraso} dia(s). Pagamento imediato necessário para ativar o ${planoNovo.nome} (próximo vencimento: ${venc30.br}).`
    };
  }

  // 2. Sem plano pago ativo / sem dias restantes: nova assinatura com pagamento imediato
  if (diasRestantes <= 0 || valorAtual <= 0 || codigoAtual === 'GRATIS') {
    return {
      tipoMudanca: 'NOVA_ASSINATURA', estaAtrasado: false, diasAtraso: 0, precisaPagamentoImediato: valorNovo > 0,
      planoAtualCodigo: codigoAtual, planoAtualNome: nomeAtual, valorPlanoAtual: valorAtual, valorPlanoNovo: valorNovo,
      diasRestantesAtuais: 0, creditoProporcionalAtual: 0, diasConvertidosNovoPlano: 30,
      diasAcessoTotalNovo: 30, novaDataVencimento: venc30.iso, novaDataVencimentoBr: venc30.br,
      valorCobrarAgora: valorNovo,
      resumoExplicativo: `Nova assinatura do ${planoNovo.nome} por R$ ${valorNovo.toFixed(2)}/mês com vigência de 30 dias (até ${venc30.br}).`
    };
  }

  // 3. Empresa ativa em dia com saldo de créditos: converte crédito em dias do novo plano e altera o vencimento
  const diariaAtual = valorAtual / 30;
  const diariaNova = valorNovo / 30;
  const creditoAtual = Number((diariaAtual * diasRestantes).toFixed(2));
  const diasConvertidos = diariaNova > 0 ? Math.floor(creditoAtual / diariaNova) : 30;
  const tipoMudanca = valorNovo > valorAtual ? 'UPGRADE' : valorNovo < valorAtual ? 'DOWNGRADE' : 'RENOVACAO';

  if (diasConvertidos >= 1 && tipoMudanca !== 'RENOVACAO') {
    const novoVenc = addDiasIso(diasConvertidos);
    return {
      tipoMudanca, estaAtrasado: false, diasAtraso: 0, precisaPagamentoImediato: false,
      planoAtualCodigo: codigoAtual, planoAtualNome: nomeAtual, valorPlanoAtual: valorAtual, valorPlanoNovo: valorNovo,
      diasRestantesAtuais: diasRestantes, creditoProporcionalAtual: creditoAtual,
      diasConvertidosNovoPlano: diasConvertidos, diasAcessoTotalNovo: diasConvertidos,
      novaDataVencimento: novoVenc.iso, novaDataVencimentoBr: novoVenc.br,
      valorCobrarAgora: 0,
      resumoExplicativo: `Seu saldo de R$ ${creditoAtual.toFixed(2)} (${diasRestantes}d no ${nomeAtual}) equivale a ${diasConvertidos} dia(s) no ${planoNovo.nome}. Troca imediata sem cobrança hoje; novo vencimento: ${novoVenc.br}.`
    };
  }

  // Crédito insuficiente para 1 dia no novo plano (ou renovação): pagamento imediato
  const diferenca = Number(Math.max(5, valorNovo - creditoAtual).toFixed(2));
  return {
    tipoMudanca, estaAtrasado: false, diasAtraso: 0, precisaPagamentoImediato: true,
    planoAtualCodigo: codigoAtual, planoAtualNome: nomeAtual, valorPlanoAtual: valorAtual, valorPlanoNovo: valorNovo,
    diasRestantesAtuais: diasRestantes, creditoProporcionalAtual: creditoAtual,
    diasConvertidosNovoPlano: 30, diasAcessoTotalNovo: 30,
    novaDataVencimento: venc30.iso, novaDataVencimentoBr: venc30.br,
    valorCobrarAgora: diferenca,
    resumoExplicativo: `Saldo de crédito R$ ${creditoAtual.toFixed(2)} abatido da mensalidade. Valor a pagar agora: R$ ${diferenca.toFixed(2)} (novo vencimento: ${venc30.br}).`
  };
}
