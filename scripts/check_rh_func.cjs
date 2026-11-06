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
  const { data: rhFunc } = await supabase.from('rh_funcionarios').select('id, nome, cargo');
  console.log('Total rh_funcionarios:', rhFunc?.length);
  rhFunc?.forEach(f => console.log(`[RH] ${f.id} | ${f.nome} | ${f.cargo}`));
}

check();

