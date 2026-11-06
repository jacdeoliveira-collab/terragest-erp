const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectBankAccounts() {
  const { data: contas } = await supabase.from('contas_bancarias').select('*');
  console.log("Contas Bancárias cadastradas:", contas);

  const { data: trans } = await supabase.from('transacoes_bancarias').select('*');
  console.log("Transações Bancárias:", trans?.length);
  trans?.forEach(t => console.log(`Trans: ${t.data} | R$ ${t.valor} | ${t.tipo} | ${t.descricao} | Banco: ${t.banco_id}`));
}

inspectBankAccounts();

