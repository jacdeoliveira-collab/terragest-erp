const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function findDriveLinks() {
  const tables = ['servicos_horimetro', 'medicoes', 'contas_pagar', 'abastecimentos', 'ordens_servico'];
  for (const t of tables) {
    const { data } = await supabase.from(t).select('*');
    data?.forEach(row => {
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'string' && (v.includes('drive.google.com') || v.includes('http') || v.includes('.pdf'))) {
          console.log(`[${t}] col=${k}: ${v.substring(0, 150)} | rowId=${row.id} | client=${row.cliente_nome || row.fornecedor || ''}`);
        }
        if (Array.isArray(v)) {
          v.forEach((item, idx) => {
            const str = JSON.stringify(item);
            if (str.includes('drive.google.com') || str.includes('http') || str.includes('.pdf') || str.includes('2500')) {
              console.log(`[${t}] array col=${k}[${idx}]: ${str.substring(0, 200)} | rowId=${row.id}`);
            }
          });
        }
      }
    });
  }
}

findDriveLinks();

