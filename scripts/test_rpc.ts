import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function testRpc() {
  const { data, error } = await supabase.rpc('criar_usuario_tenant', {
    p_tenant_id: '00000000-0000-0000-0000-000000000001',
    p_email: 'teste_diagnostico@teste.com',
    p_password: 'senha_teste_123',
    p_perfil_acesso: 'ADMIN'
  });
  console.log('RPC TEST RESULT:', { data, error });

  const { data: tu, error: tuErr } = await supabase.from('tenant_users').select('*');
  console.log('TENANT_USERS TABLE:', { data: tu, error: tuErr });
}

testRpc();
