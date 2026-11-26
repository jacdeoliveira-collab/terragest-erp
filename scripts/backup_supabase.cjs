const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => {
  const m = envContent.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabaseKey = serviceKey || anonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL ou chave do Supabase ausentes no .env!');
  process.exit(1);
}

const TABELAS = [
  'tenants', 'tenant_users', 'tenant_modulos', 'tenant_integrations', 'saas_assinaturas',
  'obras', 'obra_documentos', 'clientes', 'orcamentos', 'servicos_horimetro',
  'equipment', 'catalogo_equipamentos', 'equipamento_documentos', 'agenda_operacional',
  'daily_bulletins', 'apontamentos_viagens_producao', 'checklists_diarios', 'planos_manutencao',
  'abastecimentos', 'almoxarifado_movimentacoes', 'categorias_custos',
  'medicoes', 'contas_pagar', 'contas_bancarias', 'transacoes_caixa',
  'rh_funcionarios', 'funcionario_documentos', 'epis_entregues', 'manutencoes'
];

async function exportarTabela(supabase, tabela) {
  const todos = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from(tabela).select('*').range(from, from + pageSize - 1);
    if (error) return { tabela, erro: error.message, rows: null };
    if (!data || data.length === 0) break;
    todos.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return { tabela, erro: null, rows: todos };
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (!serviceKey && process.env.BACKUP_EMAIL && process.env.BACKUP_PASSWORD) {
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: process.env.BACKUP_EMAIL,
      password: process.env.BACKUP_PASSWORD
    });
    if (authErr) {
      console.error('❌ Falha no login para backup:', authErr.message);
      process.exit(1);
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(__dirname, '../backups', hoje);
  fs.mkdirSync(outDir, { recursive: true });

  const resumo = { data: new Date().toISOString(), modo: serviceKey ? 'service_role' : (process.env.BACKUP_EMAIL ? 'authenticated' : 'anon'), tabelas: [] };
  let totalRegistros = 0;

  for (const tabela of TABELAS) {
    const res = await exportarTabela(supabase, tabela);
    if (res.erro) {
      resumo.tabelas.push({ tabela, status: 'ERRO', registros: 0, erro: res.erro });
      console.log(`⚠️  ${tabela.padEnd(30)} | ERRO: ${res.erro}`);
    } else {
      fs.writeFileSync(path.join(outDir, `${tabela}.json`), JSON.stringify(res.rows, null, 2), 'utf-8');
      totalRegistros += res.rows.length;
      resumo.tabelas.push({ tabela, status: 'OK', registros: res.rows.length });
      console.log(`✅ ${tabela.padEnd(30)} | ${String(res.rows.length).padStart(5)} registro(s)`);
    }
  }

  resumo.totalRegistros = totalRegistros;
  fs.writeFileSync(path.join(outDir, '_resumo.json'), JSON.stringify(resumo, null, 2), 'utf-8');
  console.log('-----------------------------------------------------------');
  console.log(`📦 Backup concluído em: ${outDir}`);
  console.log(`📊 Total de registros exportados: ${totalRegistros}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
