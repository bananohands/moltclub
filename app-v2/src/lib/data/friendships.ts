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
