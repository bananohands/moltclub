export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/30 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
      <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300/75">{title}</h2>
      <div className="text-sm leading-7 text-amber-100/75">{children}</div>
    </section>
  );
}
