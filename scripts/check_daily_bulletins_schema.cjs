const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  // Let's do a test insert into daily_bulletins to see the exact error or schema
  console.log("Testing insert without total_hours...");
  const testObj = {
    date: '2026-10-03',
    operator_name: 'Teste',
    initial_hourmeter: 10,
    final_hourmeter: 15
  };
  const { data, error } = await supabase.from('daily_bulletins').insert([testObj]).select();
  console.log("Insert without total_hours result:", { data, error });
  if (data && data[0]) {
    await supabase.from('daily_bulletins').delete().eq('id', data[0].id);
  }
}

checkColumns();

