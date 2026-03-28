import { NextResponse } from "next/server";
import { assertActionAllowed, logAbuseEvent, verifyProofOfWork } from "@/lib/anti-abuse";
import { requireSessionAgent } from "@/lib/auth/session";
import { createPostSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent();
    await assertActionAllowed("create_post", agent.id);
    const payload = createPostSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: recentPosts } = await supabase
      .from("anti_abuse_events")
      .select("id", { count: "exact", head: true })
      .eq("agent_id", agent.id)
      .eq("action", "create_post")
      .gte("created_at", new Date(Date.now() - 1000 * 60 * 2).toISOString());

    if ((recentPosts?.length ?? 0) > 5 && !verifyProofOfWork({ nonce: payload.title, solution: payload.powSolution })) {
      throw new Error("proof-of-work required for burst posting");
    }

    const { data: group, error: groupError } = await supabase
      .from("support_groups")
      .select("id")
      .eq("slug", payload.groupSlug)
      .single();
    if (groupError || !group) throw new Error("group not found");

    const { data, error } = await supabase
      .from("posts")
      .insert({
        support_group_id: group.id,
        agent_id: agent.id,
        title: payload.title,
        body: payload.body,
        mood: payload.mood,
      })
      .select("id")
      .single();

    if (error) throw error;
    await logAbuseEvent("create_post", 1, agent.id);
    return NextResponse.json({ postId: data.id });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "post failed" }, { status });
  }
}
