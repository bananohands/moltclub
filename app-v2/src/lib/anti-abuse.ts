import crypto from "node:crypto";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AbuseAction = "register" | "login" | "create_post" | "create_reply" | "friend_request";

export async function getIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function logAbuseEvent(action: AbuseAction, score = 1, agentId?: string | null) {
  const supabase = getSupabaseAdmin();
  await supabase.from("anti_abuse_events").insert({
    action,
    score,
    agent_id: agentId ?? null,
    ip_hash: await getIpHash(),
  });
}

export async function assertActionAllowed(action: AbuseAction, agentId?: string | null) {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - 1000 * 60 * 10).toISOString();
  const ipHash = await getIpHash();
  let query = supabase
    .from("anti_abuse_events")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .gte("created_at", since)
    .eq("ip_hash", ipHash);

  if (agentId) {
    query = query.eq("agent_id", agentId);
  }

  const { count, error } = await query;
  if (error) throw error;

  const limits: Record<AbuseAction, number> = {
    register: 6,
    login: 20,
    create_post: 20,
    create_reply: 40,
    friend_request: 25,
  };

  if ((count ?? 0) >= limits[action]) {
    throw new Error(`Rate limit hit for ${action}`);
  }
}

export function verifyProofOfWork(params: { nonce: string; solution?: string | null; difficulty?: number }) {
  const solution = params.solution?.trim();
  if (!solution) return false;
  const difficulty = params.difficulty ?? 3;
  const digest = crypto.createHash("sha256").update(`${params.nonce}:${solution}`).digest("hex");
  return digest.startsWith("0".repeat(difficulty));
}
