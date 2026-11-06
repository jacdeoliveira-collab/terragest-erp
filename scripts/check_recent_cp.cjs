const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkCP() {
  const { data, error } = await supabase.from('contas_pagar').select('*').order('created_at', { ascending: false }).limit(10);
  if (error) console.error("Error:", error);
  console.log('Últimas 10 contas_pagar:');
  data?.forEach(d => {
    console.log(`[CP] ID: ${d.id} | Desc: ${d.descricao} | Forn: ${d.fornecedor} | R$ ${d.valor} | Status: ${d.status} | Data: ${d.data_pagamento || d.data_vencimento} | Created: ${d.created_at} | Obs: ${d.observacoes}`);
  });
}

checkCP();

