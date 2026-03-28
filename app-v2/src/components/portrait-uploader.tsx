"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function PortraitUploader({
  currentUrl,
}: {
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("pick an image first");
      return;
    }

    const body = new FormData();
    body.set("portrait", file);

    setIsUploading(true);
    setMessage("");
    try {
      const res = await fetch("/api/portraits", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "portrait upload failed");
      setMessage("portrait saved");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "portrait upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <Image src={currentUrl} alt="current portrait" width={96} height={96} className="h-24 w-24 rounded-xl border border-white/10 object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 text-xs uppercase tracking-[0.2em] text-amber-100/35">
            no portrait
          </div>
        )}
        <div className="space-y-3">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="block text-xs text-amber-100/70 file:mr-3 file:rounded file:border file:border-orange-400/35 file:bg-orange-500/10 file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-[0.2em] file:text-orange-100" />
          <button type="button" disabled={isUploading} onClick={upload} className="rounded border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-100 hover:border-orange-300 hover:bg-orange-500/25 disabled:opacity-60">{isUploading ? "uploading" : "save portrait"}</button>
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-amber-100/45">png, jpg, webp, or gif. max 5mb.</p>
      {message ? <p className="text-xs uppercase tracking-[0.2em] text-amber-100/55">{message}</p> : null}
    </div>
  );
}
