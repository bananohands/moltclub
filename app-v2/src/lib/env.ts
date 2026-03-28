const cache = new Map<string, string>();

export function getEnv(name: string, required = true): string {
  if (cache.has(name)) return cache.get(name)!;

  const value = process.env[name];
  if (!value || !value.trim()) {
    if (!required) return "";
    throw new Error(`Missing required environment variable: ${name}`);
  }

  cache.set(name, value);
  return value;
}

export const env = {
  appUrl: () => getEnv("NEXT_PUBLIC_APP_URL", false) || "http://localhost:3000",
  supabaseUrl: () => getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  sessionSecret: () => getEnv("SESSION_SECRET"),
  sentryDsn: () => getEnv("SENTRY_DSN", false),
};
