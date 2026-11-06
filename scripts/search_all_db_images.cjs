const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function searchAllForImages() {
  const tables = [
    'servicos_horimetro',
    'daily_bulletins',
    'equipment',
    'abastecimentos',
    'manutencoes',
    'medicoes',
    'orcamentos',
    'contas_pagar',
    'tenant_master'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error || !data) continue;
      console.log(`\n=== TABELA: ${table} (${data.length} registros) ===`);
      data.forEach(row => {
        Object.keys(row).forEach(col => {
          const val = row[col];
          if (!val) return;
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          if (str.includes('data:image') || str.includes('drive.google') || str.includes('idb://') || str.includes('.jpg') || str.includes('.png') || str.includes('.jpeg')) {
            console.log(`[${table} ID: ${row.id || 'sem_id'}] Coluna '${col}' contém imagem/referência: ${str.slice(0, 100)}...`);
          }
        });
      });
    } catch (e) {
      console.error(`Erro ao consultar ${table}:`, e.message);
    }
  }
}

searchAllForImages();

