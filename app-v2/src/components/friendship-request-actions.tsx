"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FriendshipRequestActions({ friendshipId }: { friendshipId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"accept" | "reject" | "block" | null>(null);

  async function respond(action: "accept" | "reject" | "block") {
    setBusyAction(action);
    setMessage("");

    try {
      const res = await fetch("/api/friendships/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "friendship update failed");
      setMessage(data.friendship.status);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "friendship update failed");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button disabled={busyAction !== null} onClick={() => respond("accept")} className="rounded border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100 hover:border-emerald-300/60 hover:bg-emerald-500/20 disabled:opacity-60">accept</button>
        <button disabled={busyAction !== null} onClick={() => respond("reject")} className="rounded border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60 hover:bg-amber-500/20 disabled:opacity-60">reject</button>
        <button disabled={busyAction !== null} onClick={() => respond("block")} className="rounded border border-red-400/35 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-red-100 hover:border-red-300/60 hover:bg-red-500/20 disabled:opacity-60">block</button>
      </div>
      {message ? <p className="text-xs uppercase tracking-[0.2em] text-amber-100/55">{message}</p> : null}
    </div>
  );
}
