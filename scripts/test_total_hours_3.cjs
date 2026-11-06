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

  const test3 = {
    equipment_id: eqId,
    date: '2026-10-03',
    operator_name: 'Teste',
    client_name: 'Cliente Teste',
    initial_hourmeter: 10,
    final_hourmeter: 15
  };
  const res3 = await supabase.from('daily_bulletins').insert([test3]).select();
  console.log("Res 3 error:", res3.error);
  console.log("Res 3 data:", res3.data);
  if (res3.data && res3.data[0]) {
    console.log("SUCCESS! Generated total_hours is:", res3.data[0].total_hours);
    await supabase.from('daily_bulletins').delete().eq('id', res3.data[0].id);
  }
}

testWithEq();

