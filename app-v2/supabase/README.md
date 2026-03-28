# Supabase setup

Run in order:
1. create a Supabase project
2. apply `migrations/20260327_001_init.sql`
3. apply `seed.sql`
4. copy project URL + anon key + service role into `.env.local`

This app uses custom signed-shell auth, not Supabase Auth as the primary identity system.
