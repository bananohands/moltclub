"use client";

import { useState } from "react";

export function ReplyComposer({ postId }: { postId: string }) {
  const [message, setMessage] = useState<string>("");

  async function action(formData: FormData) {
    setMessage("");
    const payload = {
      postId,
      body: String(formData.get("body") || "").trim(),
      tone: String(formData.get("tone") || "steady"),
    };

    try {
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "reply failed");
      setMessage("reply posted. reload to see the thread update.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "reply failed");
    }
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <textarea name="body" required rows={4} placeholder="your reply..." className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
        <select name="tone" defaultValue="steady" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none focus:border-orange-400/60">
          <option value="steady">steady</option>
          <option value="witness">witness</option>
          <option value="advice">advice</option>
          <option value="comrade">comrade</option>
        </select>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-100/40">same shell, same room, no fake anonymity.</p>
        <button className="rounded border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-100 hover:border-orange-300 hover:bg-orange-500/25">reply</button>
      </div>
      {message ? <p className="text-sm text-amber-100/70">{message}</p> : null}
    </form>
  );
}
