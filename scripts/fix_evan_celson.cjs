const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function fixEvanCelson() {
  const { data: srvs } = await supabase.from('servicos_horimetro').select('id, cliente_nome, maquinas_itens, foto_horimetro_inicial, foto_horimetro_final').in('id', [
    'dc5e3a1d-c876-46a8-9a0c-edfaa90eb0e8',
    '5b50c69d-9fba-4d47-9f89-8a4ee19f7931'
  ]);

  for (const s of srvs) {
    const maq0 = s.maquinas_itens?.[0];
    if (maq0 && maq0.foto_horimetro_inicial) {
      console.log(`Fixing ${s.cliente_nome}...`);
      await supabase.from('servicos_horimetro').update({
        foto_horimetro_inicial: maq0.foto_horimetro_inicial,
        foto_horimetro_final: maq0.foto_horimetro_final
      }).eq('id', s.id);
      console.log(`Updated ${s.cliente_nome}!`);
    }
  }
}

fixEvanCelson();

