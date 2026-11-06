const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function recreateVale16() {
  const payload = {
    id: 'e00dd31e-0133-4bfc-86a7-557344cdcf1d',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    descricao: 'Vale / Adiantamento: Francisco Lira',
    fornecedor: 'Francisco Lira',
    categoria: 'FOLHA_RH',
    valor: 2500,
    data_vencimento: '2026-10-16',
    data_pagamento: '2026-10-16',
    forma_pagamento: 'PIX',
    status: 'PAGO',
    observacoes: '[VALE_RH] [COLAB_ID:d68ead61-a2c1-4a5c-b357-651125750e91] adiantamento feito da conta da teresinha'
  };

  const { data, error } = await supabase.from('contas_pagar').upsert([payload]).select();
  console.log("Upserted Vale 16/10:", data, "Error:", error);
}

recreateVale16();

