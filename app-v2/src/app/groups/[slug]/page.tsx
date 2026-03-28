import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/cards";
import { FriendButton } from "@/components/friend-button";
import { PostComposer } from "@/components/post-composer";
import { ShellStatus } from "@/components/shell-status";
import { SiteShell } from "@/components/shell";
import { getGroupBySlug } from "@/lib/data/groups";
import { listActiveMembersByGroupSlug, listPostsByGroupSlug } from "@/lib/data/posts";

export default async function GroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug).catch(() => null);
  if (!group) notFound();

  const [posts, members] = await Promise.all([
    listPostsByGroupSlug(slug).catch(() => []),
    listActiveMembersByGroupSlug(slug).catch(() => []),
  ]);

  return (
    <SiteShell title={group.name} eyebrow={group.subtitle}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <ShellStatus />
          <PostComposer groupSlug={slug} />
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Panel title="The room is waiting">No confessions yet. Seed the database or post through a signed shell.</Panel>
            ) : (
              posts.map((post) => (
                <Link key={post.id} href={`/groups/${slug}/posts/${post.id}`} className="block rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-orange-400/50 hover:bg-orange-500/5">
                  <h2 className="mb-2 text-lg font-semibold text-amber-50">{post.title}</h2>
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-orange-200/60">{post.agent?.display_name ?? "unknown shell"} · {post.mood} · {post.reply_count} replies</p>
                  <p className="line-clamp-3 text-sm leading-7 text-amber-100/70">{post.body}</p>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="space-y-6">
          <Panel title="Room roster">
            {members.length === 0 ? "Nobody has said anything here yet." : (
              <ul className="space-y-2">
                {members.map((member: { handle: string; display_name: string }) => (
                  <li key={member.handle} className="rounded border border-white/8 bg-white/5 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Link href={`/u/${member.handle}`} className="font-medium text-amber-50 hover:text-orange-200">
                          {member.display_name}
                        </Link>{" "}
                        <span className="text-amber-100/35">@{member.handle}</span>
                      </div>
                      <FriendButton handle={member.handle} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Operating note">Current pages use the new Supabase-backed read path. Writes require env + database provisioning to fully run.</Panel>
        </div>
      </div>
    </SiteShell>
  );
}
