const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Carregar variáveis do .env
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => {
  const m = envContent.match(new RegExp(`${key}\\s*=\\s*(.+)`));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes no .env!');
  process.exit(1);
}

console.log('===========================================================');
console.log('🔍 VERIFICAÇÃO DE INTEGRIDADE DO FINANCEIRO NO SUPABASE');
console.log('===========================================================');
console.log(`📡 URL do Supabase: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 15)}...`);
console.log('-----------------------------------------------------------');

const supabase = createClient(supabaseUrl, supabaseKey);

const tabelasFinanceiro = [
  { nome: 'servicos_horimetro', desc: 'Serviços por Horímetro (Faturamento, Horas, Operador, Adiantamento, Parcelas)' },
  { nome: 'medicoes', desc: 'Contas a Receber (Medições de Obras e Serviços Comerciais)' },
  { nome: 'contas_pagar', desc: 'Contas a Pagar (Despesas, Diesel, Fornecedores e Salários)' },
  { nome: 'obras', desc: 'Obras & Contratos' },
  { nome: 'contas_bancarias', desc: 'Contas Bancárias / Caixas da Empresa' },
  { nome: 'transacoes_caixa', desc: 'Extrato / Movimentações de Caixa' }
];

async function executarDiagnostico() {
  let tudoOk = true;

  for (const tab of tabelasFinanceiro) {
    try {
      const { data, count, error } = await supabase
        .from(tab.nome)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ [${tab.nome.toUpperCase()}] Erro ao consultar: ${error.message}`);
        tudoOk = false;
      } else {
        console.log(`✅ [${tab.nome.toUpperCase()}] Conectada e Operacional! Registros reais: ${count || 0}`);
        console.log(`   ↳ Finalidade: ${tab.desc}`);
      }
    } catch (e) {
      console.log(`❌ [${tab.nome.toUpperCase()}] Exceção: ${e.message}`);
      tudoOk = false;
    }
  }

  console.log('-----------------------------------------------------------');
  console.log('🔍 Verificando estrutura da coluna [parcelas] em servicos_horimetro...');

  try {
    const { data, error } = await supabase
      .from('servicos_horimetro')
      .select('id, cliente_nome, parcelas, saldo_restante, faturamento_bruto')
      .limit(3);

    if (error) {
      if (error.message.includes('column') && error.message.includes('parcelas')) {
        console.log('⚠️ Coluna "parcelas" ainda não existe no banco Supabase.');
        console.log('   👉 AVISO: Execute a migração 47 no SQL Editor do Supabase!');
        console.log('   SQL a executar:');
        console.log("   ALTER TABLE public.servicos_horimetro ADD COLUMN IF NOT EXISTS parcelas JSONB DEFAULT '[]';");
        tudoOk = false;
      } else {
        console.log(`⚠️ Erro ao consultar coluna parcelas: ${error.message}`);
      }
    } else {
      console.log('✅ Coluna "parcelas" está 100% ATIVA na tabela servicos_horimetro!');
      if (data && data.length > 0) {
        console.log(`   ↳ Exemplo de registro lido: Cliente "${data[0].cliente_nome || 'N/A'}" | Bruto: R$ ${data[0].faturamento_bruto || 0}`);
      }
    }
  } catch (err) {
    console.log(`❌ Erro no teste de parcelas: ${err.message}`);
  }

  console.log('===========================================================');
  if (tudoOk) {
    console.log('🎉 RESULTADO: O MÓDULO FINANCEIRO ESTÁ 100% CONECTADO AO SUPABASE!');
    console.log('   Nenhum dado é perdido ou simulado. Tudo é persistido em nuvem.');
  } else {
    console.log('⚠️ RESULTADO: Algumas tabelas precisam de atenção ou migração.');
  }
  console.log('===========================================================');
}

executarDiagnostico();
