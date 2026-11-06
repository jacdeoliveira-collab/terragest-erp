const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function findVale16() {
  const { data: v1, error } = await supabase.from('contas_pagar').select('*').eq('id', 'e00dd31e-0133-4bfc-86a7-557344cdcf1d');
  console.log("Busca por ID e00dd...:", v1, error);

  const { data: allVales } = await supabase
    .from('contas_pagar')
    .select('id, valor, data_pagamento, descricao, observacoes, fornecedor, tenant_id')
    .or('fornecedor.ilike.%Francisco%,observacoes.ilike.%Francisco%,descricao.ilike.%Francisco%');
  console.log("Todos os registros de Francisco em contas_pagar (total):", allVales?.length);
  allVales?.forEach(v => {
    console.log(`- ID: ${v.id} | Data: ${v.data_pagamento} | R$ ${v.valor} | Desc: ${v.descricao} | Obs: ${v.observacoes}`);
  });
}

findVale16();

