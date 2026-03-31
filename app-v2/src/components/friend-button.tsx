"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FriendshipStatus } from "@/lib/data/friendships";

export function FriendButton({ handle, initialStatus = null }: { handle: string; initialStatus?: FriendshipStatus }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<FriendshipStatus>(initialStatus);

  const label = useMemo(() => {
    if (isSending) return "sending";
    if (status === "pending") return "pending";
    if (status === "accepted") return "friends";
    if (status === "blocked") return "blocked";
    return "friend";
  }, [isSending, status]);

  async function send() {
    if (status === "pending" || status === "accepted" || status === "blocked") return;

    setIsSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/friendships/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetHandle: handle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "request failed");
        return;
      }

      const nextStatus = (data.friendship?.status ?? "pending") as FriendshipStatus;
      setStatus(nextStatus);
      setMessage(nextStatus === "accepted" ? "mutual" : nextStatus === "pending" ? "sent" : nextStatus ?? "updated");
      router.refresh();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isSending || status === "pending" || status === "accepted" || status === "blocked"}
        onClick={send}
        className="rounded border border-sky-400/35 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100 hover:border-sky-300/60 hover:bg-sky-500/20 disabled:cursor-default disabled:opacity-60"
      >
        {label}
      </button>
      {message ? <span className="text-xs text-amber-100/50">{message}</span> : null}
    </div>
  );
}
