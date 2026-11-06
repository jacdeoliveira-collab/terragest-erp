const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function fixValesDefinitivo() {
  console.log("--- 1. EXCLUIR O VALE DUPLICADO DE 2500 (e00dd31e-...) ---");
  const { error: delErr } = await supabase
    .from('contas_pagar')
    .delete()
    .eq('id', 'e00dd31e-0133-4bfc-86a7-557344cdcf1d');
  console.log("Delete duplicado:", delErr ? delErr.message : "OK");

  console.log("--- 2. CONVERTER O CP DE 800 PARA VALE_RH OFICIAL ---");
  const { data: upCp, error: upErr } = await supabase
    .from('contas_pagar')
    .update({
      descricao: 'Vale / Adiantamento: Francisco Lira (R$ 800,00)',
      observacoes: '[VALE_RH] [COLAB_ID:d68ead61-a2c1-4a5c-b357-651125750e91] Vale / Adiantamento pago ao operador em dinheiro',
      status: 'PAGO',
      forma_pagamento: 'DINHEIRO',
      data_pagamento: '2026-10-30',
      tenant_id: '00000000-0000-0000-0000-000000000001'
    })
    .eq('id', '1e6160f6-c6f7-4437-94e7-2d611ec4f817')
    .select();
  console.log("Update CP 800:", upCp, upErr);

  console.log("--- 3. AJUSTAR SERVIÇO 11073cb1 (MANIM ESTRADA) PARA NÃO DUPLICAR O 800 ---");
  const { data: upSrv, error: srvErr } = await supabase
    .from('servicos_horimetro')
    .update({
      adiantamento_operador_valor: 0,
      saldo_pagar_operador: 300,
      status_pagamento_operador: 'PENDENTE'
    })
    .eq('id', '11073cb1-9fd3-4239-80ad-e8821637b8ff')
    .select();
  console.log("Update Servico:", upSrv ? "OK" : srvErr);

  console.log("--- 4. CONFERIR VALES APÓS AJUSTE ---");
  const { data: vales } = await supabase
    .from('contas_pagar')
    .select('id, valor, data_pagamento, descricao, observacoes, forma_pagamento, status')
    .ilike('observacoes', '%VALE_RH%');
  console.log("Vales oficiais:", vales);
}

fixValesDefinitivo();

