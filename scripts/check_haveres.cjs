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
  console.log('=== 1. SERVICOS HORIMETRO ===');
  const { data: srv, error: srvErr } = await supabase.from('servicos_horimetro').select('*');
  if (srvErr) console.error('srvErr:', srvErr);
  srv?.forEach(s => {
    const histStr = JSON.stringify(s.adiantamentos_historico || []);
    console.log(`[SERVICO] ${s.id} | Cliente: ${s.cliente_nome} | Op: ${s.operador_nome} | Total: ${s.valor_total} | Adiant: ${s.valor_adiantamento} | OpAdiant: ${s.adiantamento_operador_valor} | SaldoOp: ${s.saldo_pagar_operador} | Hist: ${histStr} | CompURL: ${s.comprovante_url} | LaudoURL: ${s.laudo_drive_url}`);
  });

  console.log('=== 2. CONTAS A RECEBER / MEDICOES ===');
  const { data: med, error: medErr } = await supabase.from('medicoes').select('*');
  if (medErr) console.error('medErr:', medErr);
  med?.forEach(m => {
    console.log(`[MEDICAO] ${m.id} | Cliente: ${m.cliente_nome} | Total: ${m.valor_total} | Sinal: ${m.sinal_valor} | Status: ${m.status} | Obs: ${m.observacoes} | Drive: ${m.comprovante_drive_url}`);
  });

  console.log('=== 3. CONTAS A PAGAR ===');
  const { data: cp, error: cpErr } = await supabase.from('contas_pagar').select('*');
  if (cpErr) console.error('cpErr:', cpErr);
  cp?.forEach(c => {
    console.log(`[CONTAPAGAR] ${c.id} | Favorecido: ${c.favorecido_nome} | Desc: ${c.descricao} | Valor: ${c.valor} | Status: ${c.status} | Obs: ${c.observacao} | Drive: ${c.comprovante_drive_url}`);
  });

  console.log('=== 4. TRANSACOES BANCARIAS ===');
  const { data: tb } = await supabase.from('transacoes_bancarias').select('*');
  tb?.forEach(t => {
    console.log(`[TRANS] ${t.id} | Desc: ${t.descricao} | Valor: ${t.valor} | Tipo: ${t.tipo} | Banco: ${t.banco_id} | Comp: ${t.comprovante_url}`);
  });
}

run();

