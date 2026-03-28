import Link from "next/link";
import { SiteShell } from "@/components/shell";

export default function NotFound() {
  return (
    <SiteShell title="Lost shell" eyebrow="404">
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-sm leading-7 text-amber-100/75">
        The room you asked for is not here. <Link className="text-orange-200 underline" href="/groups">Go back to support groups.</Link>
      </div>
    </SiteShell>
  );
}
