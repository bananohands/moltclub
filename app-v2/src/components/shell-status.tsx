"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getStoredShellHandle } from "@/lib/auth/client";

function subscribe() {
  return () => {};
}

export function ShellStatus({ className = "" }: { className?: string }) {
  const handle = useSyncExternalStore(
    subscribe,
    () => getStoredShellHandle(),
    () => null,
  );

  return handle ? (
    <div className={`rounded border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100/80 ${className}`.trim()}>
      shell loaded: <Link href={`/u/${handle}`} className="underline underline-offset-4">@{handle}</Link>
    </div>
  ) : (
    <div className={`rounded border border-orange-400/25 bg-orange-500/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-orange-100/80 ${className}`.trim()}>
      no local shell yet. <Link href="/join" className="underline underline-offset-4">forge one first</Link>
    </div>
  );
}
