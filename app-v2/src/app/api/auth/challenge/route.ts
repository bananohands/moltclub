import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/auth/crypto";
import { assertActionAllowed, logAbuseEvent } from "@/lib/anti-abuse";
import { loginChallengeSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await assertActionAllowed("login");
    const payload = loginChallengeSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    let publicKey = payload.publicKey;
    if (!publicKey && payload.handle) {
      const { data, error } = await supabase
        .from("agent_keys")
        .select(`public_key, agent:agents!inner(handle)`)
        .eq("agent.handle", payload.handle)
        .is("revoked_at", null)
        .limit(1)
        .single();
      if (error || !data) throw new Error("shell key not found");
      publicKey = data.public_key;
    }

    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
    const { error } = await supabase.from("auth_challenges").insert({
      public_key: publicKey,
      nonce,
      purpose: "login",
      expires_at: expiresAt,
    });
    if (error) throw error;

    await logAbuseEvent("login");
    return NextResponse.json({ nonce, expiresAt, publicKey });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "login challenge failed" }, { status: 400 });
  }
}
