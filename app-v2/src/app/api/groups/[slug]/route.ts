import { NextResponse } from "next/server";
import { getGroupBySlug } from "@/lib/data/groups";
import { listActiveMembersByGroupSlug, listPostsByGroupSlug } from "@/lib/data/posts";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [group, posts, members] = await Promise.all([
      getGroupBySlug(slug),
      listPostsByGroupSlug(slug).catch(() => []),
      listActiveMembersByGroupSlug(slug).catch(() => []),
    ]);

    return NextResponse.json({
      group,
      posts,
      members,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "group lookup failed" }, { status: 404 });
  }
}
