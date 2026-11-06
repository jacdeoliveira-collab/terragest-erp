const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testPostgrestOr() {
  const funcId = 'd68ead61-a2c1-4a5c-b357-651125750e91';
  const funcNome = 'Francisco Lira';
  const tenantId = '00000000-0000-0000-0000-000000000001';

  let q1 = supabase.from('contas_pagar').select('id, valor, observacoes, descricao').eq('categoria', 'FOLHA_RH');
  q1 = q1.or(`fornecedor.ilike.%${funcNome}%,observacoes.ilike.%[COLAB_ID:${funcId}]%`);
  q1 = q1.eq('tenant_id', tenantId);

  const res1 = await q1;
  console.log("Res 1 count:", res1.data?.length, "error:", res1.error);
  const vales1 = (res1.data || []).filter(cp => cp.observacoes?.includes('[VALE_RH]') || cp.descricao?.toLowerCase().includes('vale'));
  console.log("Vales 1 encontrados:", vales1);
}

testPostgrestOr();
