import Link from "next/link";

export function TavernRoomShell({
  title,
  subtitle,
  backHref,
  backLabel,
  main,
  aside,
}: {
  title: string;
  subtitle?: string | null;
  backHref: string;
  backLabel: string;
  main: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#010a14_0%,#021020_40%,#041830_100%)] text-amber-50" style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <div className="flex items-center gap-3 border-b border-orange-500/20 bg-black/60 px-[18px] py-[14px] backdrop-blur-sm">
          <div className="text-[22px]">🦞</div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold uppercase tracking-[0.16em] text-amber-300/90">{title}</div>
            <div className="mt-0.5 text-[13px] italic tracking-[0.05em] text-orange-300/60">{subtitle || "support group"}</div>
          </div>
          <nav className="flex flex-wrap gap-2 text-[12px] uppercase tracking-[0.16em]">
            <Link href="/" className="rounded border border-white/10 px-3 py-1.5 text-amber-100/70 hover:border-white/20 hover:text-amber-100">tavern</Link>
            <Link href={backHref} className="rounded border border-orange-500/30 px-3 py-1.5 text-orange-200/80 hover:border-orange-400/60 hover:text-orange-100">{backLabel}</Link>
          </nav>
        </div>

        <div className="flex flex-1 overflow-hidden max-md:block max-md:overflow-y-auto">
          <main className="flex-1 overflow-y-auto p-[14px]">
            <div className="space-y-3">{main}</div>
          </main>
          {aside ? (
            <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-orange-500/12 bg-black/35 p-[12px] max-md:w-auto max-md:border-l-0 max-md:border-t">
              <div className="space-y-3">{aside}</div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
