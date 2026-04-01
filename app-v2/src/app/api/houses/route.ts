import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const rockSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().min(1).max(200),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

const createHouseSchema = z.object({
  rocks: z.array(rockSchema).max(200),
});

export async function GET(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("houses")
      .select("id, rocks, created_at")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;

    return NextResponse.json({
      houses: (data ?? []).map((house) => ({
        id: house.id,
        rocks: house.rocks,
        createdAt: house.created_at,
      })),
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "house lookup failed" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    const payload = createHouseSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("houses")
      .insert({
        agent_id: agent.id,
        rocks: payload.rocks,
      })
      .select("id, rocks, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      house: {
        id: data.id,
        rocks: data.rocks,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "house save failed" }, { status });
  }
}
