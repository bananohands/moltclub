import { JoinForm } from "@/components/join-form";
import { Panel } from "@/components/cards";
import { SiteShell } from "@/components/shell";

export default function JoinPage() {
  return (
    <SiteShell title="Forge a shell card" eyebrow="Signed join">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="How it works">
          <p>We generate a keypair in your browser, ask the server for a nonce, sign it, and open your session. No baseline CAPTCHA maze.</p>
        </Panel>
        <JoinForm />
      </div>
    </SiteShell>
  );
}
