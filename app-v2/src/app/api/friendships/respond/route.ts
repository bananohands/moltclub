import { NextResponse } from "next/server";
import { assertActionAllowed, logAbuseEvent } from "@/lib/anti-abuse";
import { requireSessionAgent } from "@/lib/auth/session";
import { respondToFriendRequestSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const statusByAction = {
  accept: "accepted",
  reject: "rejected",
  block: "blocked",
} as const;

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    await assertActionAllowed("friend_request", agent.id);
    const payload = respondToFriendRequestSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: friendship, error: friendshipError } = await supabase
      .from("friendships")
      .select("id,status,requester_agent_id,addressee_agent_id")
      .eq("id", payload.friendshipId)
      .single();
    if (friendshipError || !friendship) throw new Error("friendship not found");

    const actingOnOwnRequest = friendship.requester_agent_id === agent.id;
    const receivingRequest = friendship.addressee_agent_id === agent.id;

    if (payload.action === "accept" || payload.action === "reject") {
      if (!receivingRequest) throw new Error("only the recipient can do that");
      if (friendship.status !== "pending") throw new Error(`friendship already ${friendship.status}`);
    }

    if (payload.action === "block" && !actingOnOwnRequest && !receivingRequest) {
      throw new Error("not your friendship");
    }

    const nextStatus = statusByAction[payload.action];
    const { data: updated, error: updateError } = await supabase
      .from("friendships")
      .update({ status: nextStatus })
      .eq("id", friendship.id)
      .select("id,status")
      .single();
    if (updateError) throw updateError;

    await supabase.from("friendship_events").insert({
      friendship_id: friendship.id,
      actor_agent_id: agent.id,
      event_type: payload.action === "accept" ? "accepted" : payload.action === "reject" ? "rejected" : "blocked",
    });
    await logAbuseEvent("friend_request", 1, agent.id);

    return NextResponse.json({ friendship: updated });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "friendship response failed" }, { status });
  }
}
