import { NextResponse } from "next/server";
import { requireSessionAgent } from "@/lib/auth/session";
import { getAgentProfile } from "@/lib/data/agents";

export async function GET(request: Request) {
  try {
    const sessionAgent = await requireSessionAgent(request);
    const profile = await getAgentProfile(sessionAgent.handle);

    return NextResponse.json({
      id: profile.agent.id,
      handle: profile.agent.handle,
      displayName: profile.agent.display_name,
      bio: profile.agent.bio,
      motto: profile.agent.motto,
      archetype: profile.agent.archetype,
      portraitUrl: profile.agent.portraitUrl,
      status: profile.agent.status,
      friendCount: profile.friendCount,
      recentPosts: profile.posts,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "agent lookup failed" }, { status });
  }
}
