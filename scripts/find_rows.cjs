const fs = require('fs');
const path = require('path');
const { createClient } = require('c:/Users/aster/TerraGest_app/node_modules/@supabase/supabase-js');

const envPath = path.resolve('c:/Users/aster/TerraGest_app/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => {
  const m = envContent.match(new RegExp(`${key}\\s*=\\s*(.+)`));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function findRows() {
  // Let's check which tables have rows
  const tables = ['servicos_horimetro', 'medicoes', 'clientes', 'obras', 'contas_pagar', 'tenants', 'empresas_master'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(5);
    console.log(t, '->', data ? `${data.length} rows` : error?.message);
    if (data && data.length > 0) {
      console.log('Sample:', JSON.stringify(data[0]));
    }
  }
}

findRows();
