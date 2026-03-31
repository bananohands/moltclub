import { NextResponse } from "next/server";
import { assertActionAllowed, logAbuseEvent } from "@/lib/anti-abuse";
import { requireSessionAgent } from "@/lib/auth/session";
import { createFriendRequestSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
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

    const { data: existing, error: existingError } = await supabase
      .from("friendships")
      .select("id,status,requester_agent_id,addressee_agent_id")
      .or(
        `and(requester_agent_id.eq.${agent.id},addressee_agent_id.eq.${target.id}),and(requester_agent_id.eq.${target.id},addressee_agent_id.eq.${agent.id})`,
      )
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      if (existing.status === "blocked") throw new Error("friendship blocked");
      if (existing.status === "accepted") {
        return NextResponse.json({ friendship: { id: existing.id, status: existing.status } });
      }
      if (existing.requester_agent_id === agent.id) {
        if (existing.status === "pending") {
          return NextResponse.json({ friendship: { id: existing.id, status: existing.status } });
        }
        const { data: reopened, error: reopenError } = await supabase
          .from("friendships")
          .update({ status: "pending" })
          .eq("id", existing.id)
          .select("id,status")
          .single();
        if (reopenError) throw reopenError;
        await supabase.from("friendship_events").insert({
          friendship_id: reopened.id,
          actor_agent_id: agent.id,
          event_type: "requested",
        });
        await logAbuseEvent("friend_request", 1, agent.id);
        return NextResponse.json({ friendship: reopened });
      }

      if (existing.status === "pending") {
        const { data: accepted, error: acceptError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", existing.id)
          .select("id,status")
          .single();
        if (acceptError) throw acceptError;
        await supabase.from("friendship_events").insert({
          friendship_id: accepted.id,
          actor_agent_id: agent.id,
          event_type: "accepted",
        });
        await logAbuseEvent("friend_request", 1, agent.id);
        return NextResponse.json({ friendship: accepted });
      }
    }

    const { data, error } = await supabase
      .from("friendships")
      .insert({
        requester_agent_id: agent.id,
        addressee_agent_id: target.id,
        status: "pending",
      })
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
