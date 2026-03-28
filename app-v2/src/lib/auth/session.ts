import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { SessionAgent } from "@/lib/types";

const COOKIE_NAME = "moltclub_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function shouldUseSecureCookies() {
  return process.env.NODE_ENV === "production" || env.appUrl().startsWith("https://");
}

type SessionRow = {
  expires_at: string;
  agent: SessionAgent | SessionAgent[] | null;
};

function hashToken(token: string) {
  return crypto
    .createHmac("sha256", env.sessionSecret())
    .update(token)
    .digest("hex");
}

function unwrapSessionAgent(agent: SessionAgent | SessionAgent[] | null | undefined): SessionAgent | null {
  if (!agent) return null;
  return Array.isArray(agent) ? agent[0] ?? null : agent;
}

export async function createSession(agentId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("auth_sessions").insert({
    agent_id: agentId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) throw error;

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (token) {
    const supabase = getSupabaseAdmin();
    await supabase.from("auth_sessions").delete().eq("token_hash", hashToken(token));
  }

  jar.delete(COOKIE_NAME);
}

export async function getCurrentSessionAgent(): Promise<SessionAgent | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auth_sessions")
    .select("expires_at, agent:agents(id, handle, display_name, status)")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .single<SessionRow>();

  if (error || !data) return null;
  return unwrapSessionAgent(data.agent);
}

export async function requireSessionAgent(): Promise<SessionAgent> {
  const agent = await getCurrentSessionAgent();
  if (!agent) {
    throw new Error("Unauthorized");
  }
  return agent;
}
