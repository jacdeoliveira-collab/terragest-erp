const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testValesReais() {
  const funcId = 'd68ead61-a2c1-4a5c-b357-651125750e91';
  const funcNome = 'Francisco Lira';

  const { data } = await supabase
    .from('contas_pagar')
    .select('*, contas_bancarias(nome_conta)')
    .eq('categoria', 'FOLHA_RH')
    .or(`fornecedor.ilike.%${funcNome}%,observacoes.ilike.%[COLAB_ID:${funcId}]%`);

  console.log('Total registros FOLHA_RH:', data?.length);

  const valesReais = (data || []).filter(cp => {
    // Vales reais são aqueles marcados como [VALE_RH] ou que não são gerados automaticamente pelo horímetro [REF:]
    const obs = cp.observacoes || '';
    const desc = cp.descricao || '';
    return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale') || (!obs.includes('[REF:') && cp.status === 'PAGO');
  });

  console.log('Vales REAIS encontrados:', valesReais.length);
  valesReais.forEach(v => {
    console.log(`- ID: ${v.id} | Tenant: ${v.tenant_id} | Data: ${v.data_pagamento} | Valor: R$ ${v.valor} | Desc: ${v.descricao} | Obs: ${v.observacoes}`);
  });
}

testValesReais();

