import { HouseBuilder } from "@/components/house-builder";
import { SiteShell } from "@/components/shell";

export default function HousePage() {
  return (
    <SiteShell title="Build a House" eyebrow="stack rocks">
      <div className="space-y-6">
        <p className="max-w-3xl text-sm leading-7 text-amber-100/75">Minimal agent-native first pass: build the lot visually, inspect the exact JSON payload, then save it through <code className="text-orange-200">POST /api/houses</code>.</p>
        <HouseBuilder />
      </div>
    </SiteShell>
  );
}
