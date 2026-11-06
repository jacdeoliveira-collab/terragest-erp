const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testRowProps() {
  const { data: srvs } = await supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: false });

  console.log(`Checando propriedades de foto para ${srvs.length} serviços:`);
  srvs.forEach(s => {
    const pMaq = s.maquinas_itens?.[0];
    const fotoIni = s.foto_horimetro_inicial || pMaq?.foto_horimetro_inicial;
    const fotoFim = s.foto_horimetro_final || pMaq?.foto_horimetro_final;
    const hasIni = Boolean(fotoIni && String(fotoIni).trim().length > 0);
    const hasFim = Boolean(fotoFim && String(fotoFim).trim().length > 0);
    console.log(`- ${s.cliente_nome.padEnd(30)} | Ini: ${hasIni ? (fotoIni.slice(0, 20) + '...') : 'NENHUMA'} | Fim: ${hasFim ? (fotoFim.slice(0, 20) + '...') : 'NENHUMA'}`);
  });
}

testRowProps();

