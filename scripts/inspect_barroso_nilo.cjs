const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectBarrosoNilo() {
  const { data, error } = await supabase
    .from('servicos_horimetro')
    .select('id, cliente_nome, data_inicio, horimetro_inicial, horimetro_final, foto_horimetro_inicial, foto_horimetro_final, fotos_trabalho, maquinas_itens, observacoes, created_at, updated_at')
    .or('cliente_nome.ilike.%Barroso%,cliente_nome.ilike.%Nilo%');

  console.log("Serviços encontrados:", data?.length, "Error:", error);
  data?.forEach(s => {
    console.log("==========================================");
    console.log(`ID: ${s.id} | Cliente: ${s.cliente_nome} | Data: ${s.data_inicio}`);
    console.log(`H. Inicial: ${s.horimetro_inicial} | H. Final: ${s.horimetro_final}`);
    console.log(`Foto Inicial type/len: ${typeof s.foto_horimetro_inicial} | length: ${s.foto_horimetro_inicial ? s.foto_horimetro_inicial.length : 0}`);
    if (s.foto_horimetro_inicial) console.log(`Foto Inicial preview: ${s.foto_horimetro_inicial.slice(0, 100)}...`);
    console.log(`Foto Final type/len: ${typeof s.foto_horimetro_final} | length: ${s.foto_horimetro_final ? s.foto_horimetro_final.length : 0}`);
    if (s.foto_horimetro_final) console.log(`Foto Final preview: ${s.foto_horimetro_final.slice(0, 100)}...`);
    console.log(`Fotos Trabalho:`, s.fotos_trabalho);
    console.log(`Maquinas Itens:`, JSON.stringify(s.maquinas_itens, null, 2));
    console.log(`Obs:`, s.observacoes);
  });
}

inspectBarrosoNilo();

