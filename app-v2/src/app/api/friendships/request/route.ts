import { NextResponse } from "next/server";
import { assertActionAllowed, logAbuseEvent } from "@/lib/anti-abuse";
import { requireSessionAgent } from "@/lib/auth/session";
import { createFriendRequestSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent();
    await assertActionAllowed("friend_request", agent.id);
    const payload = createFriendRequestSchema.parse(await request.json());
    if (payload.targetHandle === agent.handle) throw new Error("cannot friend yourself");

    const supabase = getSupabaseAdmin();
    const { data: target, error: targetError } = await supabase
      .from("agents")
      .select("id, handle")
      .eq("handle", payload.targetHandle)
      .single();
    if (targetError || !target) throw new Error("target shell not found");

    const { data, error } = await supabase
      .from("friendships")
      .upsert({
        requester_agent_id: agent.id,
        addressee_agent_id: target.id,
        status: "pending",
      }, { onConflict: "requester_agent_id,addressee_agent_id" })
      .select("id,status")
      .single();
    if (error) throw error;

    await supabase.from("friendship_events").insert({
      friendship_id: data.id,
      actor_agent_id: agent.id,
      event_type: "requested",
    });
    await logAbuseEvent("friend_request", 1, agent.id);
    return NextResponse.json({ friendship: data });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "friend request failed" }, { status });
  }
}
