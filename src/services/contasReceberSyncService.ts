import type { MedicaoItem } from '../types/faturamento.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { converterServicoParaTitulos } from './contasReceberServicoAdapter';
export { liquidarTituloReceber, lancarHaverReceber } from './contasReceberBaixaService';

function resolverNomeCliente(
  item: MedicaoItem,
  servico?: ServicoHorimetro,
  obra?: { cliente_nome?: string; cliente?: string }
): string {
  if (servico?.cliente_nome && servico.cliente_nome.trim()) return servico.cliente_nome.trim();
  if (item.observacoes) {
    const m = item.observacoes.match(/Serviço Horímetro:\s*([^-]+)/i);
    if (m && m[1].trim()) return m[1].trim();
  }
  if (item.cliente_nome && item.cliente_nome !== 'Cliente Contratante' && item.cliente_nome !== '—') {
    return item.cliente_nome;
  }
  const cliObra = obra?.cliente_nome || obra?.cliente;
  if (cliObra && cliObra !== 'Cliente Contratante') return cliObra;
  return 'Cliente';
}

export function unificarTitulosReceber(
  medicoes: MedicaoItem[],
  servicos: ServicoHorimetro[],
  obrasMap: Map<string, { nome: string; cliente_nome?: string; cliente?: string }>,
  obraSelecionadaId?: string
): MedicaoItem[] {
  const servicosMap = new Map<string, ServicoHorimetro>();
  servicos.forEach((s) => { if (s?.id) servicosMap.set(s.id, s); });

  const servicosConsumidos = new Set<string>();
  const servicoObraMap = new Map<string, string>();
  const formatadosMedicoes: MedicaoItem[] = [];

  medicoes.forEach((item) => {
    let servico: ServicoHorimetro | undefined;
    if (item.observacoes) {
      const match = item.observacoes.match(/\[REF:([^\]]+)\]/);
      if (match) servico = servicosMap.get(match[1]);
    }
    if (!servico && item.numero_medicao?.startsWith('HOR-')) {
      const prefix = item.numero_medicao.replace('HOR-', '').toLowerCase();
      servico = servicos.find((s) => s.id?.toLowerCase().startsWith(prefix));
    }

    if (servico && item.obra_id) {
      servicoObraMap.set(servico.id, item.obra_id);
    }

    // Se o serviço tiver parcelas detalhadas, não usamos a medição bruta; geraremos as parcelas a partir do serviço
    if (servico?.parcelas && Array.isArray(servico.parcelas) && servico.parcelas.length > 0) {
      return;
    }

    if (servico) servicosConsumidos.add(servico.id);

    const o = obrasMap.get(item.obra_id);
    const clienteNome = resolverNomeCliente(item, servico, o);
    const bruto = servico ? Number(servico.faturamento_bruto || item.valor_total || 0) : Number(item.valor_total || 0);
    const adiantamento = servico ? Number(servico.valor_adiantamento || 0) : 0;
    const saldoRestante = servico?.saldo_restante !== undefined
      ? Number(servico.saldo_restante)
      : Math.max(0, bruto - adiantamento);

    const isQuitado = item.status_pagamento === 'PAGO' || (servico && servico.status_pagamento_cliente === 'QUITADO') || (bruto > 0 && saldoRestante <= 0);

    formatadosMedicoes.push({
      ...item,
      servico_id: servico?.id,
      cliente_nome: clienteNome,
      cliente_documento: servico?.cliente_documento,
      cliente_telefone: servico?.cliente_telefone,
      competencia: item.competencia || item.created_at?.slice(0, 7) || '2026-10',
      numero_medicao: item.numero_medicao || `MED-${item.id?.slice(0, 4)}`,
      valor_total: bruto,
      valor_adiantamento: adiantamento,
      saldo_restante: isQuitado ? 0 : saldoRestante,
      adiantamentos_historico: servico?.adiantamentos_historico || [],
      status_pagamento: isQuitado ? 'PAGO' : (adiantamento > 0 ? 'PAGO_PARCIAL' : 'AGUARDANDO_PAGAMENTO'),
      data_vencimento: item.data_vencimento || item.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      obra_nome: o?.nome || 'Obra'
    });
  });

  const titulosDeServicos: MedicaoItem[] = [];
  servicos.forEach((s) => {
    const temParcelas = Array.isArray(s.parcelas) && s.parcelas.length > 0;
    if (!temParcelas && servicosConsumidos.has(s.id)) return;

    const servObraId = (s as unknown as { obra_id?: string }).obra_id || servicoObraMap.get(s.id);
    if (obraSelecionadaId && servObraId && servObraId !== obraSelecionadaId) return;

    const o = servObraId ? obrasMap.get(servObraId) : undefined;
    titulosDeServicos.push(...converterServicoParaTitulos(s, o?.nome));
  });

  const todos = [...formatadosMedicoes, ...titulosDeServicos];
  const mapaDeduplicado = new Map<string, MedicaoItem>();

  for (const t of todos) {
    if (t.id.includes('_p') || t.numero_medicao?.includes('-P')) {
      mapaDeduplicado.set(t.id, t);
      continue;
    }
    const cliKey = (t.cliente_nome || '').trim().toLowerCase();
    const key = `${cliKey}_${t.competencia}_${Number(t.valor_total).toFixed(2)}`;
    const existente = mapaDeduplicado.get(key);
    if (!existente) {
      mapaDeduplicado.set(key, t);
    } else {
      const temPagoAtual = (Number(t.valor_adiantamento) || 0) > 0 || t.status_pagamento !== 'AGUARDANDO_PAGAMENTO';
      const temPagoExistente = (Number(existente.valor_adiantamento) || 0) > 0 || existente.status_pagamento !== 'AGUARDANDO_PAGAMENTO';
      if (temPagoAtual && !temPagoExistente) {
        mapaDeduplicado.set(key, t);
      }
    }
  }

  return Array.from(mapaDeduplicado.values());
}
