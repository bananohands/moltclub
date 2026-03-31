import { getSupabaseAdmin } from "@/lib/supabase/server";

type FriendshipAgentCard = {
  id: string;
  handle: string;
  display_name: string;
};

type RawFriendshipRow = {
  id: string;
  status: string;
  created_at: string;
  requester: FriendshipAgentCard | FriendshipAgentCard[] | null;
  addressee: FriendshipAgentCard | FriendshipAgentCard[] | null;
};

export type FriendshipRow = Omit<RawFriendshipRow, "requester" | "addressee"> & {
  requester: FriendshipAgentCard | null;
  addressee: FriendshipAgentCard | null;
};

export type FriendshipStatus = "pending" | "accepted" | "blocked" | null;

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function listPendingFriendships(agentId: string): Promise<{
  incoming: FriendshipRow[];
  outgoing: FriendshipRow[];
}> {
  const supabase = getSupabaseAdmin();
  const baseSelect = `
    id,
    status,
    created_at,
    requester:agents!friendships_requester_agent_id_fkey(id,handle,display_name),
    addressee:agents!friendships_addressee_agent_id_fkey(id,handle,display_name)
  `;

  const [{ data: incoming, error: incomingError }, { data: outgoing, error: outgoingError }] = await Promise.all([
    supabase
      .from("friendships")
      .select(baseSelect)
      .eq("addressee_agent_id", agentId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("friendships")
      .select(baseSelect)
      .eq("requester_agent_id", agentId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  if (incomingError) throw incomingError;
  if (outgoingError) throw outgoingError;

  const normalize = (rows: RawFriendshipRow[] | null | undefined): FriendshipRow[] =>
    (rows ?? []).map((row) => ({
      ...row,
      requester: unwrapOne(row.requester),
      addressee: unwrapOne(row.addressee),
    }));

  return {
    incoming: normalize(incoming as RawFriendshipRow[] | null | undefined),
    outgoing: normalize(outgoing as RawFriendshipRow[] | null | undefined),
  };
}

export async function getFriendshipStatusesByHandle(agentId: string, handles: string[]): Promise<Record<string, FriendshipStatus>> {
  const uniqueHandles = [...new Set(handles.filter(Boolean))];
  if (uniqueHandles.length === 0) return {};

  const supabase = getSupabaseAdmin();
  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("id, handle")
    .in("handle", uniqueHandles);

  if (agentsError) throw agentsError;

  const targetAgents = (agents ?? []) as Array<{ id: string; handle: string }>;
  if (targetAgents.length === 0) return {};

  const handleById = Object.fromEntries(targetAgents.map((agent) => [agent.id, agent.handle]));
  const targetIds = targetAgents.map((agent) => agent.id);
  const idList = targetIds.join(",");

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("requester_agent_id, addressee_agent_id, status")
    .or(`and(requester_agent_id.eq.${agentId},addressee_agent_id.in.(${idList})),and(requester_agent_id.in.(${idList}),addressee_agent_id.eq.${agentId})`);

  if (friendshipsError) throw friendshipsError;

  const statuses: Record<string, FriendshipStatus> = Object.fromEntries(uniqueHandles.map((handle) => [handle, null]));

  for (const friendship of (friendships ?? []) as Array<{ requester_agent_id: string; addressee_agent_id: string; status: FriendshipStatus }>) {
    const counterpartId = friendship.requester_agent_id === agentId ? friendship.addressee_agent_id : friendship.requester_agent_id;
    const handle = handleById[counterpartId];
    if (handle) statuses[handle] = friendship.status;
  }

  return statuses;
}
