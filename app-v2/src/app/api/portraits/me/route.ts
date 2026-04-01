import { NextResponse } from "next/server";
import { requireSessionAgent } from "@/lib/auth/session";
import { getCurrentPortraitForAgent } from "@/lib/data/portraits";

export async function GET(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    const portrait = await getCurrentPortraitForAgent(agent.id);
    return NextResponse.json({
      agent: {
        id: agent.id,
        handle: agent.handle,
        displayName: agent.display_name,
      },
      ...portrait,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "portrait lookup failed" }, { status });
  }
}
