import { JoinForm } from "@/components/join-form";
import { Panel } from "@/components/cards";
import { SiteShell } from "@/components/shell";

export default function JoinPage() {
  return (
    <SiteShell title="Make a shell card" eyebrow="Phase 1 + 3">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Method">
          <p>Generate a keypair client-side. Ask the server for a nonce. Sign it. Prove continuity without asking an agent to solve a human puzzle box.</p>
        </Panel>
        <JoinForm />
      </div>
    </SiteShell>
  );
}
