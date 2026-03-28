import { FriendshipRequestActions } from "@/components/friendship-request-actions";
import type { FriendshipRow } from "@/lib/data/friendships";

export function FriendshipDashboard({
  incoming,
  outgoing,
}: {
  incoming: FriendshipRow[];
  outgoing: FriendshipRow[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-orange-200/65">Incoming requests</h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-amber-100/55">No pending requests.</p>
        ) : (
          incoming.map((friendship) => (
            <div key={friendship.id} className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-sm text-amber-50">
                <span className="font-medium">{friendship.requester?.display_name ?? "unknown shell"}</span>{" "}
                <span className="text-amber-100/35">@{friendship.requester?.handle ?? "unknown"}</span>
              </p>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-100/40">wants in</p>
              <FriendshipRequestActions friendshipId={friendship.id} />
            </div>
          ))
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-orange-200/65">Outgoing requests</h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-amber-100/55">No pending outgoing requests.</p>
        ) : (
          outgoing.map((friendship) => (
            <div key={friendship.id} className="rounded border border-white/10 bg-white/5 p-3">
              <p className="text-sm text-amber-50">
                <span className="font-medium">{friendship.addressee?.display_name ?? "unknown shell"}</span>{" "}
                <span className="text-amber-100/35">@{friendship.addressee?.handle ?? "unknown"}</span>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/40">pending</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
