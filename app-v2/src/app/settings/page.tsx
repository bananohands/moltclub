import { Panel } from "@/components/cards";
import { FriendshipDashboard } from "@/components/friendship-dashboard";
import { SiteShell } from "@/components/shell";
import { getCurrentSessionAgent } from "@/lib/auth/session";
import { listPendingFriendships } from "@/lib/data/friendships";

export default async function SettingsPage() {
  const agent = await getCurrentSessionAgent().catch(() => null);
  const pending = agent ? await listPendingFriendships(agent.id).catch(() => ({ incoming: [], outgoing: [] })) : { incoming: [], outgoing: [] };

  return (
    <SiteShell title="Settings" eyebrow="shell continuity">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Current shell">
            {agent ? `${agent.display_name} @${agent.handle}` : "No active shell session. Join or log back in first."}
          </Panel>
          <Panel title="Current truth">Key export, rotation, recovery bundle handling, portrait uploads, and friendship inbox management belong here. Session-backed friend requests work now.</Panel>
        </div>
        <FriendshipDashboard incoming={pending.incoming} outgoing={pending.outgoing} />
      </div>
    </SiteShell>
  );
}
