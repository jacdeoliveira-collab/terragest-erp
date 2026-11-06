const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testOmitTotalHours() {
  const { data: eq } = await supabase.from('equipment').select('id, name').limit(1);
  const eqId = eq[0].id;

  const testPayload = {
    equipment_id: eqId,
    date: '2026-10-03',
    operator_name: 'Francisco Lira',
    client_name: 'Fazenda Alvorada',
    work_location: 'Frente Operacional',
    service_description: 'Apontamento Diário da Tarde',
    initial_hourmeter: 4291.80,
    final_hourmeter: 4344.50
    // OMITTING total_hours
  };

  const res = await supabase.from('daily_bulletins').insert([testPayload]).select();
  console.log("Insert result error:", res.error);
  if (res.data && res.data[0]) {
    console.log("SUCCESS! Created bulletin ID:", res.data[0].id, "total_hours generated:", res.data[0].total_hours);
    await supabase.from('daily_bulletins').delete().eq('id', res.data[0].id);
    console.log("Cleaned up test record.");
  }
}

testOmitTotalHours();
