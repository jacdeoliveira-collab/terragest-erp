const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: cols } = await supabase.from('colaboradores').select('id, nome, cargo, tenant_id');
  console.log('Total colaboradores:', cols?.length);
  cols?.forEach(c => console.log(`Colab: ${c.id} | ${c.nome} | ${c.cargo}`));

  const { data: cpFolha } = await supabase.from('contas_pagar').select('*').eq('categoria', 'FOLHA_RH');
  console.log('\nContas a pagar FOLHA_RH:', cpFolha?.length);
  cpFolha?.forEach(cp => {
    console.log(`[CP] ${cp.id} | ${cp.descricao} | Fav: ${cp.favorecido_nome || cp.fornecedor} | R$ ${cp.valor} | Status: ${cp.status} | Data: ${cp.data_pagamento || cp.data_vencimento} | Obs: ${cp.observacoes}`);
  });
}

check();

