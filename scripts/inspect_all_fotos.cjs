const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectAllFotos() {
  const { data: srvs, error } = await supabase
    .from('servicos_horimetro')
    .select('id, cliente_nome, data_inicio, horimetro_inicial, horimetro_final, foto_horimetro_inicial, foto_horimetro_final, fotos_trabalho, maquinas_itens, observacoes')
    .order('data_inicio', { ascending: false });

  if (error) {
    console.error("Erro ao buscar serviços:", error);
    return;
  }

  console.log(`Total de serviços: ${srvs.length}`);
  srvs.forEach((s, idx) => {
    console.log(`\n[${idx + 1}] ID: ${s.id} | Cliente: ${s.cliente_nome} | Data: ${s.data_inicio}`);
    console.log(`  - H. Ini: ${s.horimetro_inicial} | H. Fim: ${s.horimetro_final}`);
    console.log(`  - foto_ini: ${typeof s.foto_horimetro_inicial === 'string' ? s.foto_horimetro_inicial.slice(0, 50) : s.foto_horimetro_inicial}`);
    console.log(`  - foto_fim: ${typeof s.foto_horimetro_final === 'string' ? s.foto_horimetro_final.slice(0, 50) : s.foto_horimetro_final}`);
    if (s.fotos_trabalho && s.fotos_trabalho.length > 0) {
      console.log(`  - fotos_trabalho: ${JSON.stringify(s.fotos_trabalho).slice(0, 80)}`);
    }
    if (s.maquinas_itens && s.maquinas_itens.length > 0) {
      const m = s.maquinas_itens[0];
      console.log(`  - maq[0].foto_ini: ${typeof m.foto_horimetro_inicial === 'string' ? m.foto_horimetro_inicial.slice(0, 50) : m.foto_horimetro_inicial}`);
      console.log(`  - maq[0].foto_fim: ${typeof m.foto_horimetro_final === 'string' ? m.foto_horimetro_final.slice(0, 50) : m.foto_horimetro_final}`);
    }
  });
}

inspectAllFotos();
