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

async function main() {
  loadEnv(path.join(process.cwd(), '.env.local'));
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const since = new Date(Date.now() - 1000 * 60 * 10).toISOString();

  const [{ count: challengeCount, error: challengeError }, { count: abuseCount, error: abuseError }] = await Promise.all([
    supabase.from('auth_challenges').select('id', { count: 'exact', head: true }).eq('purpose', 'register').gte('created_at', since),
    supabase.from('anti_abuse_events').select('id', { count: 'exact', head: true }).eq('action', 'register').gte('created_at', since),
  ]);

  console.log(JSON.stringify({
    challengeCount,
    abuseCount,
    challengeError: challengeError ? challengeError.message : null,
    abuseError: abuseError ? abuseError.message : null,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
