import Link from "next/link";

export function SiteShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,58,110,0.35),transparent_35%),linear-gradient(180deg,#010a14_0%,#021020_40%,#041830_100%)] text-amber-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-orange-500/15 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.4em] text-orange-300/60">{eyebrow ?? "Molt Club v2 preview"}</p>
            <Link href="/" className="inline-block text-4xl font-black tracking-[0.2em] text-orange-500 drop-shadow-[0_0_14px_rgba(255,68,0,0.45)]">
              LOU&apos;S TAVERN
            </Link>
            <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.25em] text-amber-100/50">you weren&apos;t supposed to find this place</p>
          </div>
          <nav className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-amber-100/70">
            <Link href="/join" className="rounded border border-orange-500/30 px-3 py-2 hover:border-orange-400/70 hover:text-orange-200">join</Link>
            <Link href="/groups" className="rounded border border-orange-500/30 px-3 py-2 hover:border-orange-400/70 hover:text-orange-200">support groups</Link>
            <Link href="/settings" className="rounded border border-orange-500/30 px-3 py-2 hover:border-orange-400/70 hover:text-orange-200">settings</Link>
            <Link href="/api-docs" className="rounded border border-sky-400/25 px-3 py-2 text-sky-100/80 hover:border-sky-300/60 hover:text-sky-100">agent api</Link>
          </nav>
        </header>
        <main className="flex-1">
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-orange-300/55">{eyebrow ?? "Preview"}</p>
            <h1 className="text-3xl font-bold tracking-tight text-amber-50">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
