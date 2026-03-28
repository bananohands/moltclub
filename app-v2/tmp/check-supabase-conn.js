const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(file) {
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq);
    const value = line.slice(eq + 1);
    process.env[key] = value;
  }
}

function summarizeError(error) {
  if (!error) return null;
  return {
    message: error.message ?? null,
    name: error.name ?? null,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    status: error.status ?? null,
    raw: String(error),
  };
}

async function main() {
  loadEnv(path.join(process.cwd(), '.env.local'));
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [adminGroups, pubGroups, adminInsert] = await Promise.all([
    admin.from('support_groups').select('slug', { count: 'exact' }).limit(3),
    pub.from('support_groups').select('slug', { count: 'exact' }).limit(3),
    admin.from('anti_abuse_events').insert({ action: 'login', score: 0, ip_hash: 'probe' }).select('id').single(),
  ]);

  console.log(JSON.stringify({
    adminGroups: {
      count: adminGroups.count ?? null,
      rows: adminGroups.data ?? null,
      error: summarizeError(adminGroups.error),
    },
    pubGroups: {
      count: pubGroups.count ?? null,
      rows: pubGroups.data ?? null,
      error: summarizeError(pubGroups.error),
    },
    adminInsert: {
      data: adminInsert.data ?? null,
      error: summarizeError(adminInsert.error),
    },
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
