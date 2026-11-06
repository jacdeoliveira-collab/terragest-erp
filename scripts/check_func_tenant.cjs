const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: func } = await supabase.from('rh_funcionarios').select('id, nome, tenant_id').limit(5);
  console.log("Funcionario:", func);

  const { data: tenants } = await supabase.from('tenants').select('id, nome');
  console.log("Tenants:", tenants);

  const tenantId = func?.[0]?.tenant_id || tenants?.[0]?.id;
  if (tenantId) {
    // Atualizar os vales que estavam com tenant_id null
    const { data: updated, error } = await supabase
      .from('contas_pagar')
      .update({ tenant_id: tenantId })
      .ilike('observacoes', '%VALE_RH%')
      .select('id, tenant_id, valor, descricao');
    console.log("Vales atualizados com tenant_id:", updated, "Error:", error);
  }
}

check();

