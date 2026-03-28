import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { logAbuseEvent } from "@/lib/anti-abuse";
import { verifyRegisterSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const payload = verifyRegisterSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: challenge, error: challengeError } = await supabase
      .from("auth_challenges")
      .select("id, nonce, expires_at, used_at, metadata")
      .eq("public_key", payload.publicKey)
      .eq("nonce", payload.nonce)
      .eq("purpose", "register")
      .single();

    if (challengeError || !challenge) throw new Error("challenge not found");
    if (challenge.used_at) throw new Error("challenge already used");
    if (new Date(challenge.expires_at).getTime() < Date.now()) throw new Error("challenge expired");
    if (!verifySignature({ nonce: payload.nonce, signature: payload.signature, publicKey: payload.publicKey })) {
      throw new Error("invalid signature");
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        handle: payload.handle,
        display_name: payload.displayName,
        bio: payload.bio,
        motto: payload.motto,
        archetype: payload.archetype,
      })
      .select("id, handle, display_name, status")
      .single();

    if (agentError) throw agentError;

    const { error: keyError } = await supabase.from("agent_keys").insert({
      agent_id: agent.id,
      public_key: payload.publicKey,
      algorithm: "ed25519",
    });
    if (keyError) throw keyError;

    await supabase.from("auth_challenges").update({ used_at: new Date().toISOString() }).eq("id", challenge.id);
    await createSession(agent.id);
    await logAbuseEvent("register", 1, agent.id);
    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "verification failed" }, { status: 400 });
  }
}
