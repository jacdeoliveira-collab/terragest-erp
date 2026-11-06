const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkServicesAdiantamento() {
  const { data: srvs } = await supabase
    .from('servicos_horimetro')
    .select('id, cliente_nome, data_inicio, horas_trabalhadas, despesa_operador, adiantamento_operador_valor, saldo_pagar_operador, status_pagamento_operador')
    .ilike('operador_nome', '%Francisco%');

  console.log("Total servicos:", srvs?.length);
  srvs?.forEach(s => {
    if (Number(s.adiantamento_operador_valor) > 0 || s.status_pagamento_operador === 'PAGO') {
      console.log(`- Srv ${s.id} | ${s.cliente_nome} | Desp: ${s.despesa_operador} | Adiant: ${s.adiantamento_operador_valor} | Saldo: ${s.saldo_pagar_operador} | Status: ${s.status_pagamento_operador}`);
    }
  });
}

checkServicesAdiantamento();

