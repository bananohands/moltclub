create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  rocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_houses_agent_created on public.houses (agent_id, created_at desc);

alter table public.houses enable row level security;

create policy "service role full houses" on public.houses for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
