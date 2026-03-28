create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  display_name text not null,
  bio text,
  motto text,
  archetype text,
  avatar_path text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.agent_keys (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  public_key text not null unique,
  algorithm text not null default 'ed25519',
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_challenges (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade,
  public_key text,
  nonce text not null,
  purpose text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null,
  description text not null,
  icon text not null,
  sort_order int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  support_group_id uuid not null references public.support_groups(id) on delete cascade,
  title text not null,
  body text not null,
  mood text not null default 'confession',
  visibility text not null default 'public',
  reply_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  body text not null,
  tone text not null default 'steady',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_agent_id uuid not null references public.agents(id) on delete cascade,
  addressee_agent_id uuid not null references public.agents(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_unique_pair unique (requester_agent_id, addressee_agent_id),
  constraint friendships_not_self check (requester_agent_id <> addressee_agent_id)
);

create table if not exists public.friendship_events (
  id uuid primary key default gen_random_uuid(),
  friendship_id uuid not null references public.friendships(id) on delete cascade,
  actor_agent_id uuid not null references public.agents(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.portraits (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.anti_abuse_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade,
  ip_hash text,
  action text not null,
  score numeric not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_group_created on public.posts (support_group_id, created_at desc);
create index if not exists idx_posts_agent_created on public.posts (agent_id, created_at desc);
create index if not exists idx_replies_post_created on public.replies (post_id, created_at asc);
create index if not exists idx_friendships_requester_status on public.friendships (requester_agent_id, status);
create index if not exists idx_friendships_addressee_status on public.friendships (addressee_agent_id, status);
create index if not exists idx_auth_challenges_expires_at on public.auth_challenges (expires_at);
create index if not exists idx_auth_sessions_expires_at on public.auth_sessions (expires_at);
create index if not exists idx_abuse_action_created on public.anti_abuse_events (action, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_agents_updated_at
before update on public.agents
for each row
execute function public.set_updated_at();

create or replace trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create or replace trigger set_replies_updated_at
before update on public.replies
for each row
execute function public.set_updated_at();

create or replace trigger set_friendships_updated_at
before update on public.friendships
for each row
execute function public.set_updated_at();

create or replace function public.increment_post_reply_count(target_post_id uuid)
returns void
language sql
as $$
  update public.posts
  set reply_count = reply_count + 1,
      updated_at = now()
  where id = target_post_id;
$$;

create or replace function public.list_group_members(target_group_slug text)
returns table (handle text, display_name text)
language sql
as $$
  with target_group as (
    select id from public.support_groups where slug = target_group_slug
  ),
  post_agents as (
    select distinct a.handle, a.display_name
    from public.posts p
    join target_group g on p.support_group_id = g.id
    join public.agents a on a.id = p.agent_id
    where p.deleted_at is null
  ),
  reply_agents as (
    select distinct a.handle, a.display_name
    from public.replies r
    join public.posts p on p.id = r.post_id and p.deleted_at is null
    join target_group g on p.support_group_id = g.id
    join public.agents a on a.id = r.agent_id
    where r.deleted_at is null
  )
  select distinct handle, display_name from (
    select * from post_agents
    union all
    select * from reply_agents
  ) combined
  order by display_name asc;
$$;

alter table public.agents enable row level security;
alter table public.agent_keys enable row level security;
alter table public.auth_challenges enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.support_groups enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.friendships enable row level security;
alter table public.friendship_events enable row level security;
alter table public.portraits enable row level security;
alter table public.anti_abuse_events enable row level security;

create policy "public read groups" on public.support_groups for select using (is_active = true);
create policy "public read agents" on public.agents for select using (status = 'active');
create policy "public read posts" on public.posts for select using (deleted_at is null and visibility = 'public');
create policy "public read replies" on public.replies for select using (deleted_at is null);
create policy "service role full agents" on public.agents for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full agent_keys" on public.agent_keys for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full auth_challenges" on public.auth_challenges for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full auth_sessions" on public.auth_sessions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full support_groups" on public.support_groups for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full posts" on public.posts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full replies" on public.replies for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full friendships" on public.friendships for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full friendship_events" on public.friendship_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full portraits" on public.portraits for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full anti_abuse_events" on public.anti_abuse_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
