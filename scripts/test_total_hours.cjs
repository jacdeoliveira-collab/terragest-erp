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
  if (!eq || !eq[0]) {
    console.log("No equipment found");
    return;
  }
  const eqId = eq[0].id;
  console.log("Using equipment:", eq[0]);

  console.log("--- TESTE 1: COM total_hours ---");
  const test1 = {
    equipment_id: eqId,
    date: '2026-10-03',
    operator_name: 'Teste',
    initial_hourmeter: 10,
    final_hourmeter: 15,
    total_hours: 5
  };
  const res1 = await supabase.from('daily_bulletins').insert([test1]).select();
  console.log("Res 1 (com total_hours):", res1.error ? res1.error.message : "SUCCESS!");

  console.log("--- TESTE 2: SEM total_hours ---");
  const test2 = {
    equipment_id: eqId,
    date: '2026-10-03',
    operator_name: 'Teste',
    initial_hourmeter: 10,
    final_hourmeter: 15
  };
  const res2 = await supabase.from('daily_bulletins').insert([test2]).select();
  console.log("Res 2 (sem total_hours):", res2.error ? res2.error.message : "SUCCESS! Record:", res2.data[0]);

  if (res2.data && res2.data[0]) {
    await supabase.from('daily_bulletins').delete().eq('id', res2.data[0].id);
  }
}

testWithEq();

