const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: funcs } = await supabase.from('rh_funcionarios').select('*').ilike('nome', '%Francisco%');
  const funcionario = funcs[0];
  const tenantAtivoId = '00000000-0000-0000-0000-000000000001';

  let qSrv = supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: false });
  qSrv = qSrv.or(`operador_id.eq.${funcionario.id},operador_nome.ilike.%${funcionario.nome}%`);
  if (tenantAtivoId) qSrv = qSrv.eq('tenant_id', tenantAtivoId);

  let qBde = supabase.from('daily_bulletins').select('*').order('date', { ascending: false });
  qBde = qBde.or(`operador_id.eq.${funcionario.id},operator_name.ilike.%${funcionario.nome}%`);
  if (tenantAtivoId) qBde = qBde.eq('tenant_id', tenantAtivoId);

  let qVales = supabase.from('contas_pagar').select('*, contas_bancarias(nome_conta)').eq('categoria', 'FOLHA_RH').order('data_pagamento', { ascending: false });
  qVales = qVales.or(`fornecedor.ilike.%${funcionario.nome}%,observacoes.ilike.%[COLAB_ID:${funcionario.id}]%`);
  if (tenantAtivoId) qVales = qVales.eq('tenant_id', tenantAtivoId);

  const [resSrv, resBde, resVales] = await Promise.all([qSrv, qBde, qVales]);
  const servicos = resSrv.data || [];
  const rawVales = resVales.data || [];

  const valesReais = rawVales.filter((cp) => {
    const obs = cp.observacoes || '';
    const desc = cp.descricao || '';
    return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale');
  });

  const vales = valesReais.map((cp) => ({
    id: cp.id,
    valor: Number(cp.valor) || 0,
    data: cp.data_pagamento || cp.data_vencimento || '',
    observacao: cp.observacoes?.replace(/\[VALE_RH\]/g, '')?.replace(/\[COLAB_ID:[^\]]+\]/g, '')?.trim() || cp.descricao,
    status: cp.status === 'PAGO' ? 'PAGO' : 'PENDENTE'
  }));

  let totalGanhos = 0, totalPago = 0, totalSaldoAberto = 0, qtdQuitados = 0;
  const remuneracoes = servicos.map((s) => {
    const hrs = Number(s.horas_trabalhadas) || 0;
    const vHora = Number(s.valor_hora_operador) || (hrs > 0 ? Number(s.despesa_operador || 0) / hrs : 0);
    const ganho = Number(s.despesa_operador) > 0 ? Number(s.despesa_operador) : hrs * vHora;
    const pago = Number(s.adiantamento_operador_valor) || 0;
    const saldo = s.saldo_pagar_operador !== undefined ? Number(s.saldo_pagar_operador) : Math.max(0, ganho - pago);
    const status = s.status_pagamento_operador || (saldo <= 0.01 && ganho > 0 ? 'PAGO' : 'PENDENTE');

    totalGanhos += ganho; totalPago += pago; totalSaldoAberto += saldo;
    if (status === 'PAGO' || (ganho > 0 && saldo <= 0.01)) qtdQuitados += 1;

    return { cliente: s.cliente_nome, ganho, pago, saldo, status };
  });

  const totalValesDiretos = vales.reduce((acc, v) => acc + v.valor, 0);
  const totalPagoConsolidado = totalPago + totalValesDiretos;
  const totalSaldoConsolidado = Math.max(0, totalGanhos - totalPagoConsolidado);

  console.log("RESULTADOS HOOK RH:");
  console.log("- Total Ganhos:", totalGanhos);
  console.log("- Total Pago Serviços:", totalPago);
  console.log("- Total Vales Diretos:", totalValesDiretos);
  console.log("- Total Pago Consolidado (Serviços + Vales):", totalPagoConsolidado);
  console.log("- Saldo Restante Consolidado:", totalSaldoConsolidado);
  console.log("- Qtd Vales Reais:", vales.length);
  vales.forEach(v => console.log("  * Vale:", v.data, "R$", v.valor, v.observacao));
  console.log("- Qtd Serviços Quitados:", qtdQuitados);
}

run();

