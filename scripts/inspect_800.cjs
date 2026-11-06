const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect800() {
  const { data: cp800 } = await supabase.from('contas_pagar').select('*').eq('id', '1e6160f6-c6f7-4437-94e7-2d611ec4f817');
  console.log("CP 800:", cp800);

  const { data: srv800 } = await supabase.from('servicos_horimetro').select('*').eq('id', '11073cb1-9fd3-4239-80ad-e8821637b8ff');
  console.log("Servico ligado ao 800:", srv800);

  // Buscar todos os 800 em contas_pagar e servicos_horimetro
  const { data: all800 } = await supabase.from('contas_pagar').select('*').eq('valor', 800);
  console.log("Todos os CP com valor 800:", all800);
}

inspect800();

