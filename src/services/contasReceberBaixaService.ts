import { supabase } from '../lib/supabase';
import type { FormaPagamentoTitulo } from '../types/faturamento.types';
import type { AdiantamentoItem } from '../types/servicoHorimetro.types';
import { parseParcelaRef, liquidarParcelaReceber } from './contasReceberParcelaBaixa';

function extrairRefServico(idOuObs: string): string {
  if (idOuObs.startsWith('serv_')) return idOuObs.replace('serv_', '');
  const m = idOuObs.match(/\[REF:([^\]]+)\]/);
  return m ? m[1] : idOuObs;
}

export async function liquidarTituloReceber(
  id: string,
  dataPagamento: string,
  formaPagamento: FormaPagamentoTitulo | string,
  contaBancariaId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const parcelaRef = parseParcelaRef(id);
    if (parcelaRef) {
      return await liquidarParcelaReceber(parcelaRef.servId, parcelaRef.numParc, dataPagamento, formaPagamento);
    }

    const isServicoId = id.startsWith('serv_');
    const realId = isServicoId ? id.replace('serv_', '') : id;

    if (isServicoId) {
      await supabase.from('servicos_horimetro').update({
        status_pagamento_cliente: 'QUITADO',
        saldo_restante: 0,
        updated_at: new Date().toISOString()
      }).eq('id', realId);

      await supabase.from('medicoes').update({
        status_pagamento: 'PAGO',
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        conta_bancaria_id: contaBancariaId || null,
        updated_at: new Date().toISOString()
      }).ilike('observacoes', `%[REF:${realId}]%`);
    } else {
      const { error: updErr } = await supabase.from('medicoes').update({
        status_pagamento: 'PAGO',
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        conta_bancaria_id: contaBancariaId || null,
        updated_at: new Date().toISOString()
      }).eq('id', id);

      if (updErr) throw new Error(updErr.message);

      // Se a medição tiver [REF:serv_id], quita também o serviço correspondente
      const { data: med } = await supabase.from('medicoes').select('observacoes').eq('id', id).maybeSingle();
      if (med?.observacoes) {
        const servId = extrairRefServico(med.observacoes);
        if (servId && servId !== med.observacoes) {
          await supabase.from('servicos_horimetro').update({
            status_pagamento_cliente: 'QUITADO',
            saldo_restante: 0,
            updated_at: new Date().toISOString()
          }).eq('id', servId);
        }
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao liquidar' };
  }
}

export async function lancarHaverReceber(
  idOuRef: string,
  valorHaver: number,
  dataPagamento: string,
  formaPagamento: string,
  observacao?: string
): Promise<{ success: boolean; error?: string; saldoRestante?: number; valorTotal?: number; clienteNome?: string }> {
  try {
    let servId = extrairRefServico(idOuRef);

    // Se veio id de medicao pura, busca na tabela medicoes
    if (!idOuRef.startsWith('serv_')) {
      const { data: med } = await supabase.from('medicoes').select('observacoes').eq('id', idOuRef).maybeSingle();
      if (med?.observacoes) servId = extrairRefServico(med.observacoes);
    }

    const { data: serv, error: sErr } = await supabase
      .from('servicos_horimetro')
      .select('*')
      .eq('id', servId)
      .maybeSingle();

    if (sErr || !serv) {
      throw new Error('Serviço correspondente não encontrado para registrar o haver.');
    }

    const historico: AdiantamentoItem[] = Array.isArray(serv.adiantamentos_historico)
      ? [...serv.adiantamentos_historico]
      : [];

    const novoHaver: AdiantamentoItem = {
      id: 'HAV_' + Date.now().toString(36).toUpperCase(),
      valor: Number(valorHaver),
      data: dataPagamento,
      forma_pagamento: formaPagamento,
      observacao: observacao?.trim() || 'Haver / Pagamento parcial registrado no Contas a Receber'
    };
    historico.push(novoHaver);

    const totAdiant = historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0);
    const bruto = Number(serv.faturamento_bruto) || 0;
    const saldo = Math.max(0, Number((bruto - totAdiant).toFixed(2)));
    const statusCli = saldo <= 0 ? 'QUITADO' : 'PARCIAL';

    await supabase.from('servicos_horimetro').update({
      valor_adiantamento: totAdiant,
      data_adiantamento: dataPagamento,
      forma_pagamento_adiantamento: formaPagamento,
      adiantamentos_historico: historico,
      saldo_restante: saldo,
      status_pagamento_cliente: statusCli,
      updated_at: new Date().toISOString()
    }).eq('id', servId);

    // Atualiza medição vinculada
    const medStatus = saldo <= 0 ? 'PAGO' : 'PAGO_PARCIAL';
    await supabase.from('medicoes').update({
      status_pagamento: medStatus,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento,
      observacoes: `Serviço Horímetro: ${serv.cliente_nome} - ${serv.maquina_nome} [Sinal: R$ ${totAdiant}] [REF:${serv.id}]`
    }).ilike('observacoes', `%[REF:${serv.id}]%`);

    return {
      success: true,
      saldoRestante: saldo,
      valorTotal: bruto,
      clienteNome: serv.cliente_nome
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao lançar haver' };
  }
}
