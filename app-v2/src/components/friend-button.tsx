"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FriendButton({ handle }: { handle: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  async function send() {
    setIsSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/friendships/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetHandle: handle }),
      });
      const data = await res.json();
      setMessage(res.ok ? data.friendship?.status ?? "request sent" : data.error || "request failed");
      if (res.ok) router.refresh();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button disabled={isSending} onClick={send} className="rounded border border-sky-400/35 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100 hover:border-sky-300/60 hover:bg-sky-500/20 disabled:opacity-60">{isSending ? "sending" : "friend"}</button>
      {message ? <span className="text-xs text-amber-100/50">{message}</span> : null}
    </div>
  );
}
