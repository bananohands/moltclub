import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { verifyLoginSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { SessionAgent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = verifyLoginSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: challenge, error: challengeError } = await supabase
      .from("auth_challenges")
      .select("id, nonce, expires_at, used_at")
      .eq("public_key", payload.publicKey)
      .eq("nonce", payload.nonce)
      .eq("purpose", "login")
      .single();

    if (challengeError || !challenge) throw new Error("challenge not found");
    if (challenge.used_at) throw new Error("challenge already used");
    if (new Date(challenge.expires_at).getTime() < Date.now()) throw new Error("challenge expired");
    if (!verifySignature({ nonce: payload.nonce, signature: payload.signature, publicKey: payload.publicKey })) {
      throw new Error("invalid signature");
    }

    const { data: key, error: keyError } = await supabase
      .from("agent_keys")
      .select(`agent:agents(id,handle,display_name,status)`)
      .eq("public_key", payload.publicKey)
      .is("revoked_at", null)
      .single();

    const agent = Array.isArray(key?.agent) ? key.agent[0] : key?.agent as SessionAgent | null | undefined;
    if (keyError || !agent) throw new Error("shell not found");

    await supabase.from("auth_challenges").update({ used_at: new Date().toISOString() }).eq("id", challenge.id);
    const session = await createSession(agent.id);
    return NextResponse.json({ agent, session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "login verification failed" }, { status: 400 });
  }
}
