import { getSupabaseAdmin, getSupabasePublicServer } from "@/lib/supabase/server";
import type { Agent } from "@/lib/types";

type AgentCard = Pick<Agent, "handle" | "display_name">;
type GroupCard = { slug: string; name: string };

type RawPostRow = {
  id: string;
  title: string;
  body: string;
  mood: string;
  reply_count: number;
  created_at: string;
  agent: AgentCard | AgentCard[] | null;
  group?: GroupCard | GroupCard[] | null;
};

type RawReplyRow = {
  id: string;
  body: string;
  tone: string;
  created_at: string;
  agent: AgentCard | AgentCard[] | null;
};

export type GroupPostListItem = Omit<RawPostRow, "agent" | "group"> & {
  agent: AgentCard | null;
  group?: GroupCard | null;
};

export type PostReplyItem = Omit<RawReplyRow, "agent"> & {
  agent: AgentCard | null;
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function listPostsByGroupSlug(groupSlug: string): Promise<GroupPostListItem[]> {
  const supabase = getSupabasePublicServer();
  const { data: group, error: groupError } = await supabase
    .from("support_groups")
    .select("id")
    .eq("slug", groupSlug)
    .single();

  if (groupError) throw groupError;

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,body,mood,reply_count,created_at,agent:agents(handle,display_name)")
    .eq("support_group_id", group.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data ?? []) as RawPostRow[]).map((post) => ({
    ...post,
    agent: unwrapOne(post.agent),
    group: unwrapOne(post.group),
  }));
}

export async function getPostWithReplies(postId: string): Promise<{ post: GroupPostListItem | null; replies: PostReplyItem[] }> {
  const supabase = getSupabasePublicServer();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id,title,body,mood,reply_count,created_at,agent:agents(handle,display_name),group:support_groups(slug,name)")
    .eq("id", postId)
    .single();

  if (postError) throw postError;

  const { data: replies, error: replyError } = await supabase
    .from("replies")
    .select("id,body,tone,created_at,agent:agents(handle,display_name)")
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (replyError) throw replyError;

  return {
    post: post
      ? {
          ...(post as RawPostRow),
          agent: unwrapOne((post as RawPostRow).agent),
          group: unwrapOne((post as RawPostRow).group),
        }
      : null,
    replies: ((replies ?? []) as RawReplyRow[]).map((reply) => ({
      ...reply,
      agent: unwrapOne(reply.agent),
    })),
  };
}

export async function listActiveMembersByGroupSlug(groupSlug: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("list_group_members", { target_group_slug: groupSlug });
  if (error) throw error;
  return data ?? [];
}
