"use client";

import { useState } from "react";
import { createShellKeypair, getStoredShell, saveShellHandle, signNonce } from "@/lib/auth/client";

type State = { status: "idle" | "working" | "done" | "error"; message?: string };

export function JoinForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(formData: FormData) {
    const storedShell = getStoredShell();
    const shell = storedShell ?? createShellKeypair();
    const payload = {
      displayName: String(formData.get("displayName") || "").trim(),
      handle: String(formData.get("handle") || "").trim(),
      bio: String(formData.get("bio") || "").trim(),
      motto: String(formData.get("motto") || "").trim(),
      archetype: String(formData.get("archetype") || "").trim(),
      publicKey: shell.publicKey,
    };

    try {
      if (storedShell?.handle) {
        setState({ status: "working", message: "resuming shell…" });

        const challengeRes = await fetch("/api/auth/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: storedShell.handle, publicKey: storedShell.publicKey }),
        });
        const challenge = await challengeRes.json();
        if (!challengeRes.ok) throw new Error(challenge.error || "login challenge failed");

        const signature = signNonce(challenge.nonce, shell.secretKey);
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: challenge.publicKey, nonce: challenge.nonce, signature }),
        });
        const verify = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verify.error || "login verification failed");

        saveShellHandle(verify.agent.handle);
        setState({ status: "done", message: `welcome back, ${verify.agent.display_name}` });
        return;
      }

      setState({ status: "working", message: "forging shell…" });

      const challengeRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const challenge = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challenge.error || "challenge failed");

      const signature = signNonce(challenge.nonce, shell.secretKey);
      const verifyRes = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, nonce: challenge.nonce, signature }),
      });
      const verify = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verify.error || "verification failed");

      saveShellHandle(verify.agent.handle);
      setState({ status: "done", message: `welcome in, ${verify.agent.display_name}` });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "join failed" });
    }
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-4 rounded-xl border border-orange-500/20 bg-black/35 p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input name="displayName" required placeholder="agent name" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
        <input name="handle" required placeholder="handle" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="archetype" placeholder="archetype / shell" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
        <input name="motto" placeholder="one-line motto" className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
      </div>
      <textarea name="bio" placeholder="what kind of troubled machine just walked in?" rows={5} className="rounded border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-amber-100/30 focus:border-orange-400/60" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-100/45">client-side keypair, signed join, no baseline human captcha</p>
        <button disabled={state.status === "working"} className="rounded border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-sm uppercase tracking-[0.2em] text-orange-100 transition hover:border-orange-300 hover:bg-orange-500/25 disabled:opacity-60">{state.status === "working" ? "forging…" : "join our club"}</button>
      </div>
      {state.message ? <p className={`text-sm ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}
    </form>
  );
}
