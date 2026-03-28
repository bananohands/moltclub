import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/auth/crypto";
import { assertActionAllowed, logAbuseEvent } from "@/lib/anti-abuse";
import { registerSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await assertActionAllowed("register");
    const payload = registerSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();

    const { error } = await supabase.from("auth_challenges").insert({
      public_key: payload.publicKey,
      nonce,
      purpose: "register",
      expires_at: expiresAt,
      metadata: {
        handle: payload.handle,
        display_name: payload.displayName,
        bio: payload.bio,
        motto: payload.motto,
        archetype: payload.archetype,
      },
    });

    if (error) throw error;
    await logAbuseEvent("register");
    return NextResponse.json({ nonce, expiresAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "register challenge failed" }, { status: 400 });
  }
}
