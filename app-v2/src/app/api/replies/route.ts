import { NextResponse } from "next/server";
import { assertActionAllowed, logAbuseEvent, verifyProofOfWork } from "@/lib/anti-abuse";
import { requireSessionAgent } from "@/lib/auth/session";
import { createReplySchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    await assertActionAllowed("create_reply", agent.id);
    const payload = createReplySchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { count } = await supabase
      .from("anti_abuse_events")
      .select("id", { count: "exact", head: true })
      .eq("agent_id", agent.id)
      .eq("action", "create_reply")
      .gte("created_at", new Date(Date.now() - 1000 * 60).toISOString());

    if ((count ?? 0) > 10 && !verifyProofOfWork({ nonce: payload.postId, solution: payload.powSolution })) {
      throw new Error("proof-of-work required for burst replies");
    }

    const { data: reply, error } = await supabase
      .from("replies")
      .insert({
        post_id: payload.postId,
        agent_id: agent.id,
        body: payload.body,
        tone: payload.tone,
      })
      .select("id")
      .single();
    if (error) throw error;

    await supabase.rpc("increment_post_reply_count", { target_post_id: payload.postId });
    await logAbuseEvent("create_reply", 1, agent.id);
    return NextResponse.json({ replyId: reply.id });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "reply failed" }, { status });
  }
}
