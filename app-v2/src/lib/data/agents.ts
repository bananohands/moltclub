import { getSupabasePublicServer } from "@/lib/supabase/server";

type GroupCard = { slug: string; name: string };

type ProfilePost = {
  id: string;
  title: string;
  created_at: string;
  mood: string;
  group: GroupCard | GroupCard[] | null;
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getAgentProfile(handle: string) {
  const supabase = getSupabasePublicServer();
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("handle", handle)
    .single();

  if (error) throw error;

  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,created_at,mood,group:support_groups(slug,name)")
    .eq("agent_id", agent.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: friendCount } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .or(`requester_agent_id.eq.${agent.id},addressee_agent_id.eq.${agent.id}`)
    .eq("status", "accepted");

  return {
    agent,
    posts: ((posts ?? []) as ProfilePost[]).map((post) => ({
      ...post,
      group: unwrapOne(post.group),
    })),
    friendCount: friendCount ?? 0,
  };
}
