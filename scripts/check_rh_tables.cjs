const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkTables() {
  const tList = ['rh_vales', 'rh_adiantamentos', 'folha_pagamentos', 'rh_folha_fechamentos'];
  for (const t of tList) {
    const { error } = await supabase.from(t).select('id').limit(1);
    console.log(`Table ${t}:`, error ? error.message : 'EXISTS');
  }
}

checkTables();

