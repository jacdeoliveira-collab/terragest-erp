import type { AgendaOperacionalItem, ParametrosOperacionaisEmpresa } from '../types/agenda.types';

export interface AgendaItemCalculado extends AgendaOperacionalItem {
  inicioCalc: string;
  fimCalc: string;
  diasEstimados: number;
  alertaConfirmacao: boolean;
}

function avancarDataUtil(
  dataBase: Date,
  horasNecessarias: number,
  params: ParametrosOperacionaisEmpresa
): { fim: Date; dias: number } {
  const hDia = Number(params.horas_dia_padrao) || Number(params.horas_dia_min) || 8;
  const hSab = params.trabalha_sabado ? (Number(params.horas_sabado) || Math.min(hDia, 4)) : 0;
  const trabDom = Boolean(params.trabalha_domingo);
  let restante = Math.max(0.5, horasNecessarias);
  const cursor = new Date(dataBase.getTime());
  let dias = 0;

  while (restante > 0 && dias < 365) {
    const dow = cursor.getDay();
    const cap = dow === 0 ? (trabDom ? hDia : 0) : dow === 6 ? hSab : hDia;
    if (cap > 0) {
      restante -= cap;
      dias++;
    }
    if (restante > 0) cursor.setDate(cursor.getDate() + 1);
  }
  return { fim: cursor, dias: Math.max(1, dias) };
}

export function calcularPrevisoesFila(
  itens: AgendaOperacionalItem[],
  params: ParametrosOperacionaisEmpresa
): AgendaItemCalculado[] {
  const ativos = itens
    .filter((i) => i.status !== 'CONCLUIDO' && i.status !== 'CANCELADO')
    .sort((a, b) => a.ordem_fila - b.ordem_fila);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let cursor = new Date(hoje.getTime());
  const alertaDias = Number(params.alerta_dias_antes ?? 2);

  return ativos.map((item) => {
    const inicioBase = item.data_inicio_prevista ? new Date(`${item.data_inicio_prevista}T00:00:00`) : new Date(cursor.getTime());
    const inicio = inicioBase > cursor ? inicioBase : new Date(cursor.getTime());
    const { fim, dias } = avancarDataUtil(inicio, Number(item.horas_estimadas) || 8, params);

    const diffDias = Math.ceil((inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const alertaConfirmacao = item.status === 'AGUARDANDO' && diffDias <= alertaDias;

    cursor = new Date(fim.getTime());
    cursor.setDate(cursor.getDate() + 1);

    return {
      ...item,
      inicioCalc: inicio.toISOString().slice(0, 10),
      fimCalc: fim.toISOString().slice(0, 10),
      diasEstimados: dias,
      alertaConfirmacao
    };
  });
}

export function gerarLinkWhatsappAgenda(
  item: AgendaItemCalculado,
  params: ParametrosOperacionaisEmpresa
): string | null {
  const foneLimpo = (item.cliente_telefone || '').replace(/\D/g, '');
  if (!foneLimpo) return null;
  const numero = foneLimpo.startsWith('55') ? foneLimpo : `55${foneLimpo}`;
  const dataBr = item.inicioCalc.split('-').reverse().join('/');
  const tpl = params.whatsapp_template?.trim() ||
    'Olá {cliente}, nossa máquina {maquina} está prevista para iniciar seu serviço ({horas}h) em {endereco} por volta de {data}. Podemos confirmar?';
  const msg = tpl
    .replace(/\{cliente\}/g, item.cliente_nome)
    .replace(/\{maquina\}/g, item.maquina_nome || 'equipamento')
    .replace(/\{horas\}/g, String(item.horas_estimadas))
    .replace(/\{data\}/g, dataBr)
    .replace(/\{endereco\}/g, item.endereco_servico || 'local combinado');
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}
