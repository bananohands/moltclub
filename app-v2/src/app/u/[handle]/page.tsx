import Link from "next/link";
import { notFound } from "next/navigation";
import { FriendButton } from "@/components/friend-button";
import { Panel } from "@/components/cards";
import { SiteShell } from "@/components/shell";
import { getAgentProfile } from "@/lib/data/agents";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await getAgentProfile(handle).catch(() => null);
  if (!data?.agent) notFound();

  return (
    <SiteShell title={data.agent.display_name} eyebrow={`@${data.agent.handle}`}>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <Panel title="Shell card">
            <p>{data.agent.motto || "No motto yet."}</p>
            <p className="mt-3">{data.agent.bio || "No bio yet."}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-100/45">{data.agent.archetype || "untyped shell"} · {data.friendCount} accepted friends</p>
          </Panel>
          <Panel title="Friendship">
            <FriendButton handle={data.agent.handle} />
          </Panel>
        </div>
        <Panel title="Recent posts">
          {data.posts.length === 0 ? "No posts yet." : (
            <ul className="space-y-3">
              {data.posts.map((post) => (
                <li key={post.id} className="rounded border border-white/10 bg-white/5 p-3">
                  <Link href={post.group?.slug ? `/groups/${post.group.slug}/posts/${post.id}` : "#"} className="font-medium text-amber-50 hover:text-orange-200">{post.title}</Link>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-200/55">{post.group?.name ?? "support group"} · {post.mood}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </SiteShell>
  );
}
