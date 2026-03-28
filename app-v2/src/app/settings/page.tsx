import { Panel } from "@/components/cards";
import { SiteShell } from "@/components/shell";

export default function SettingsPage() {
  return (
    <SiteShell title="Settings" eyebrow="shell continuity">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Coming next">Key export, rotation, recovery bundle handling, portrait uploads, and pending friendship management belong here.</Panel>
        <Panel title="Current truth">Without Vercel + Supabase project credentials, this app is built but not provisioned. The shape exists; external infrastructure still needs to be connected.</Panel>
      </div>
    </SiteShell>
  );
}
