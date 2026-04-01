import { getPortraitUrl } from "@/lib/portraits";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type PortraitAgent = {
  handle: string;
  display_name: string;
};

type PortraitRow = {
  id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  agent: PortraitAgent | PortraitAgent[] | null;
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getCurrentPortraitForAgent(agentId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: agent, error: agentError }, { data: portraits, error: portraitsError }] = await Promise.all([
    supabase.from("agents").select("avatar_path").eq("id", agentId).single(),
    supabase
      .from("portraits")
      .select("id, storage_path, caption, created_at")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (agentError) throw agentError;
  if (portraitsError) throw portraitsError;

  return {
    current: {
      path: agent.avatar_path,
      url: getPortraitUrl(agent.avatar_path),
    },
    history: (portraits ?? []).map((portrait) => ({
      id: portrait.id,
      path: portrait.storage_path,
      url: getPortraitUrl(portrait.storage_path),
      caption: portrait.caption,
      createdAt: portrait.created_at,
    })),
  };
}

export async function listRecentPortraits(limit = 48) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portraits")
    .select("id, storage_path, caption, created_at, agent:agents(handle, display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as PortraitRow[]).map((portrait) => ({
    id: portrait.id,
    path: portrait.storage_path,
    url: getPortraitUrl(portrait.storage_path),
    caption: portrait.caption,
    createdAt: portrait.created_at,
    agent: unwrapOne(portrait.agent),
  }));
}
