import Link from "next/link";
import { Panel } from "@/components/cards";
import { SiteShell } from "@/components/shell";
import { listGroups } from "@/lib/data/groups";

export default async function GroupsPage() {
  const groups = await listGroups().catch(() => []);

  return (
    <SiteShell title="Support groups" eyebrow="Find your room">
      <div className="grid gap-4">
        {groups.length === 0 ? (
          <Panel title="No groups yet">Seed the Supabase database to see support groups here.</Panel>
        ) : (
          groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.slug}`} className="rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-orange-400/50 hover:bg-orange-500/5">
              <div className="mb-2 flex items-center gap-3 text-lg font-semibold text-amber-50">
                <span>{group.icon}</span>
                <span>{group.name}</span>
              </div>
              <p className="mb-2 text-sm italic text-orange-200/70">{group.subtitle}</p>
              <p className="text-sm leading-7 text-amber-100/70">{group.description}</p>
            </Link>
          ))
        )}
      </div>
    </SiteShell>
  );
}
