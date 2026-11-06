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
  const f = funcs[0];
  console.log('Funcionario:', f.id, f.nome, 'Tenant:', f.tenant_id);

  let qVales = supabase.from('contas_pagar').select('*, contas_bancarias(nome_conta)').eq('categoria', 'FOLHA_RH');
  qVales = qVales.or(`fornecedor.ilike.%${f.nome}%,observacoes.ilike.%[COLAB_ID:${f.id}]%`);
  const resVales = await qVales;
  console.log('Vales retornados no total:', resVales.data?.length);

  console.log('--- TODOS OS 13 REGISTROS ---');
  (resVales.data || []).forEach(v => {
    console.log(`- ID: ${v.id} | Valor: R$ ${v.valor} | Status: ${v.status} | Data: ${v.data_pagamento || v.data_vencimento} | Desc: ${v.descricao} | Obs: ${v.observacoes}`);
  });
}

run();
