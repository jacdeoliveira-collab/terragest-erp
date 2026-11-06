const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testWithEq() {
  const { data: eq } = await supabase.from('equipment').select('id, name').limit(1);
  const eqId = eq[0].id;

  const test2 = {
    equipment_id: eqId,
    date: '2026-10-03',
    operator_name: 'Teste',
    initial_hourmeter: 10,
    final_hourmeter: 15
  };
  const res2 = await supabase.from('daily_bulletins').insert([test2]).select();
  console.log("Res 2 error:", res2.error);
  console.log("Res 2 data:", res2.data);
  if (res2.data && res2.data[0]) {
    await supabase.from('daily_bulletins').delete().eq('id', res2.data[0].id);
  }
}

testWithEq();

