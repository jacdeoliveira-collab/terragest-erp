const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkAll() {
  // Let's check RPC or standard tables
  const tables = [
    'servicos_horimetro',
    'colaboradores',
    'contas_pagar',
    'contas_receber',
    'medicoes',
    'bde_registros',
    'ordens_servico',
    'abastecimentos',
    'despesas',
    'recibos',
    'vales',
    'adiantamentos',
    'documentos',
    'transacoes_bancarias',
    'empresa_configuracoes'
  ];

  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(50);
      if (error) {
        // table might not exist
      } else {
        console.log(`Table ${t}: ${data.length} rows`);
        data.forEach(row => {
          const str = JSON.stringify(row);
          if (str.includes('2500') || str.includes('2.500') || str.includes('Francisco') || str.includes('Lira')) {
            console.log(`Match in ${t}:`, str.substring(0, 300));
          }
        });
      }
    } catch(e) {}
  }
}

checkAll();

