import type { MedicaoItem } from '../types/faturamento.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export function converterServicoParaTitulos(
  s: ServicoHorimetro,
  obraNome?: string
): MedicaoItem[] {
  const servObraId = (s as unknown as { obra_id?: string }).obra_id || '';
  const bruto = Number(s.faturamento_bruto || 0);
  const adiantamento = Number(s.valor_adiantamento || 0);
  const saldo = s.saldo_restante !== undefined ? Number(s.saldo_restante) : Math.max(0, bruto - adiantamento);
  if (bruto <= 0 && saldo <= 0) return [];

  const isQuitado = s.status_pagamento_cliente === 'QUITADO' || saldo <= 0;
  const nomeObra = obraNome || (s.maquina_nome ? `Serviço - ${s.maquina_nome}` : 'Serviço Comercial');
  const baseEmissao = s.data_inicio || new Date().toISOString().slice(0, 10);
  const parcelas = Array.isArray(s.parcelas) ? s.parcelas : [];

  if (parcelas.length > 0) {
    return parcelas.map((p) => {
      const pPaga = p.status === 'PAGO' || isQuitado;
      const valParc = Number(p.valor || 0);
      const venc = p.data_vencimento || s.data_fim || baseEmissao;
      return {
        id: `serv_${s.id}_p${p.numero}`,
        servico_id: s.id,
        tenant_id: s.tenant_id,
        obra_id: servObraId,
        obra_nome: nomeObra,
        cliente_nome: s.cliente_nome || 'Cliente',
        cliente_documento: s.cliente_documento,
        cliente_telefone: s.cliente_telefone,
        competencia: venc.slice(0, 7),
        numero_medicao: `HOR-${s.id.slice(0, 4).toUpperCase()}-P${p.numero}`,
        data_emissao: baseEmissao,
        data_vencimento: venc,
        total_horas_produtivas: Number(s.horas_trabalhadas || 0),
        valor_total: valParc,
        valor_adiantamento: pPaga ? valParc : 0,
        saldo_restante: pPaga ? 0 : valParc,
        adiantamentos_historico: s.adiantamentos_historico || [],
        status_pagamento: pPaga ? 'PAGO' : 'AGUARDANDO_PAGAMENTO',
        observacoes: `[REF:${s.id}] [PARC:${p.numero}] Parcela ${p.numero}/${parcelas.length} • ${s.cliente_nome}${p.forma ? ` (${p.forma})` : ''}`
      };
    });
  }

  return [{
    id: `serv_${s.id}`,
    servico_id: s.id,
    tenant_id: s.tenant_id,
    obra_id: servObraId,
    obra_nome: nomeObra,
    cliente_nome: s.cliente_nome || 'Cliente',
    cliente_documento: s.cliente_documento,
    cliente_telefone: s.cliente_telefone,
    competencia: baseEmissao.slice(0, 7),
    numero_medicao: `HOR-${s.id.slice(0, 6).toUpperCase()}`,
    data_emissao: baseEmissao,
    data_vencimento: s.data_fim || baseEmissao,
    total_horas_produtivas: Number(s.horas_trabalhadas || 0),
    valor_total: bruto,
    valor_adiantamento: adiantamento,
    saldo_restante: isQuitado ? 0 : saldo,
    adiantamentos_historico: s.adiantamentos_historico || [],
    status_pagamento: isQuitado ? 'PAGO' : (adiantamento > 0 ? 'PAGO_PARCIAL' : 'AGUARDANDO_PAGAMENTO'),
    observacoes: `[REF:${s.id}] Serviço: ${s.cliente_nome} • ${s.maquina_nome}`
  }];
}
