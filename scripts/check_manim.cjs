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
  const { data } = await supabase.from('servicos_horimetro').select('id, cliente_nome, despesa_operador, adiantamento_operador_valor, saldo_pagar_operador, status_pagamento_operador').eq('id', '11073cb1-9fd3-4239-80ad-e8821637b8ff');
  console.log("MANIM ESTRADA:", data);
}
run();

