const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkOtherTables() {
  console.log("=== DAILY BULLETINS ===");
  const { data: bdes } = await supabase.from('daily_bulletins').select('id, date, operator_name, client_name, initial_hourmeter, final_hourmeter, notes, service_description');
  console.log(`Total BDEs: ${bdes?.length}`);
  bdes?.forEach(b => {
    if (b.notes?.includes('FOTO') || b.notes?.includes('http') || b.notes?.includes('idb://')) {
      console.log(`[BDE] ${b.date} | ${b.client_name} | Ini: ${b.initial_hourmeter} | Fim: ${b.final_hourmeter} | Notes: ${b.notes}`);
    }
  });

  console.log("=== CHECK ALL COLUMNS IN SERVICOS_HORIMETRO ===");
  const { data: srvs } = await supabase.from('servicos_horimetro').select('*').in('id', [
    '81d9aa54-9ddb-43d0-95d8-55219f7b7995', // ANTONIO JOSE 15/10
    '338cd5fe-e684-4a47-9669-a82bb25cdd95', // Cledemilson 15/10
    '8b1ad658-7f0f-4c13-b372-470a6d7ccb8b', // ANTONIO JOSE 14/10
    'ce5819d1-57a1-473a-bcf2-a9a681920f9f', // Cledemilson 13/10
    'e780fefc-01e0-4806-b8ca-697c090c09c2', // EVANILSON 13/10
    '26a1f34f-62de-4b5e-ba2b-aaf41e92a9d4'  // ALDENIR 10/10
  ]);

  srvs?.forEach(s => {
    console.log(`\nServiço ${s.cliente_nome} (${s.data_inicio}):`);
    Object.keys(s).forEach(k => {
      const val = s[k];
      if (val !== null && val !== undefined && val !== '' && val !== 0 && (!Array.isArray(val) || val.length > 0)) {
        if (typeof val === 'string' && val.length > 80) {
          console.log(`  ${k}: [string length ${val.length}] ${val.slice(0, 60)}...`);
        } else if (Array.isArray(val) || typeof val === 'object') {
          console.log(`  ${k}:`, JSON.stringify(val).slice(0, 100));
        } else {
          console.log(`  ${k}:`, val);
        }
      }
    });
  });
}

checkOtherTables();

