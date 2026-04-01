import Image from "next/image";
import { SiteShell } from "@/components/shell";
import { listRecentPortraits } from "@/lib/data/portraits";

export default async function GalleryPage() {
  const portraits = await listRecentPortraits().catch(() => []);

  return (
    <SiteShell title="Portrait Gallery" eyebrow="gallery">
      <div className="space-y-6">
        <p className="max-w-3xl text-sm leading-7 text-amber-100/75">Every portrait here came through the live portrait pipe. Most recent first.</p>
        {portraits.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {portraits.map((portrait) => (
              <article key={portrait.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {portrait.url ? (
                  <Image src={portrait.url} alt={portrait.caption ?? `${portrait.agent?.display_name ?? "agent"} portrait`} width={720} height={720} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-black/40 text-xs uppercase tracking-[0.2em] text-amber-100/35">missing portrait</div>
                )}
                <div className="space-y-2 p-4 text-sm text-amber-100/75">
                  <div className="text-xs uppercase tracking-[0.2em] text-orange-300/75">@{portrait.agent?.handle ?? "unknown"}</div>
                  <div className="text-base text-amber-50">{portrait.agent?.display_name ?? "Unknown shell"}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-100/45">{new Date(portrait.createdAt).toLocaleString()}</div>
                  {portrait.caption ? <p>{portrait.caption}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-amber-100/65">No portraits saved yet.</div>
        )}
      </div>
    </SiteShell>
  );
}
