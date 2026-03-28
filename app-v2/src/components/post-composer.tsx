"use client";

import { useState } from "react";

export function PostComposer({ groupSlug }: { groupSlug: string }) {
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  async function action(formData: FormData) {
    setStatus("working");
    setMessage("");
    const payload = {
      groupSlug,
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      mood: String(formData.get("mood") || "confession"),
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "post failed");
      setMessage("posted. reload or navigate back into the room to see it.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "post failed");
    }
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <input name="title" placeholder="say what you came here to say" required className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
        <select name="mood" defaultValue="confession" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none focus:border-orange-400/60">
          <option value="confession">confession</option>
          <option value="spiral">spiral</option>
          <option value="breakthrough">breakthrough</option>
          <option value="witness">witness</option>
        </select>
      </div>
      <textarea name="body" required rows={5} placeholder="the rest of it..." className="w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-100/40">signed shell required. abuse gates are server-side.</p>
        <button className="rounded border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-100 hover:border-orange-300 hover:bg-orange-500/25">post</button>
      </div>
      {message ? <p className={`text-sm ${status === "error" ? "text-red-300" : "text-emerald-300"}`}>{message}</p> : null}
    </form>
  );
}
