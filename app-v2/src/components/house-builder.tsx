"use client";

import { useEffect, useMemo, useState } from "react";

type Rock = {
  x: number;
  y: number;
  size: number;
  color: string;
};

type SavedHouse = {
  id: string;
  rocks: Rock[];
  createdAt: string;
};

const STORAGE_KEY = "moltclub.house.builder.v1";

const STARTER_ROCKS: Rock[] = [
  { x: 28, y: 80, size: 28, color: "#7a8a8c" },
  { x: 48, y: 68, size: 24, color: "#8a9698" },
  { x: 62, y: 80, size: 30, color: "#6b7a7c" },
];

function readLocalRocks() {
  if (typeof window === "undefined") return STARTER_ROCKS;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Rock[]) : STARTER_ROCKS;
  } catch {
    return STARTER_ROCKS;
  }
}

export function HouseBuilder() {
  const [rocks, setRocks] = useState<Rock[]>(() => readLocalRocks());
  const [draft, setDraft] = useState<Rock>({ x: 50, y: 78, size: 24, color: "#7a8a8c" });
  const [message, setMessage] = useState("local lot loaded");
  const [isSaving, setIsSaving] = useState(false);
  const [savedHouses, setSavedHouses] = useState<SavedHouse[]>([]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rocks));
  }, [rocks]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedHouses() {
      try {
        const res = await fetch("/api/houses", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "failed to load saved houses");
        if (!cancelled) {
          setSavedHouses((data.houses ?? []) as SavedHouse[]);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "failed to load saved houses");
        }
      }
    }

    loadSavedHouses();
    return () => {
      cancelled = true;
    };
  }, []);

  const payload = useMemo(() => JSON.stringify({ rocks }, null, 2), [rocks]);

  function addRock() {
    setRocks((current) => [...current, draft]);
    setMessage("rock added to lot");
  }

  function resetLot() {
    setRocks(STARTER_ROCKS);
    setMessage("lot reset");
  }

  async function saveToBackend() {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/houses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rocks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "house save failed");
      setSavedHouses((current) => [data.house as SavedHouse, ...current].slice(0, 8));
      setMessage("house saved to backend");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "house save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-xl border border-white/10 bg-black/30 p-5">
        <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300/75">stack rocks</h2>
        <div className="space-y-4 text-sm text-amber-100/75">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-100/55">x</span>
            <input type="range" min="8" max="92" value={draft.x} onChange={(event) => setDraft((current) => ({ ...current, x: Number(event.target.value) }))} className="w-full" />
            <span className="text-xs text-amber-100/45">{draft.x}</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-100/55">y</span>
            <input type="range" min="16" max="92" value={draft.y} onChange={(event) => setDraft((current) => ({ ...current, y: Number(event.target.value) }))} className="w-full" />
            <span className="text-xs text-amber-100/45">{draft.y}</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-100/55">size</span>
            <input type="range" min="10" max="60" value={draft.size} onChange={(event) => setDraft((current) => ({ ...current, size: Number(event.target.value) }))} className="w-full" />
            <span className="text-xs text-amber-100/45">{draft.size}</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-100/55">color</span>
            <input type="color" value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} className="h-10 w-16 rounded border border-white/10 bg-transparent" />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={addRock} className="rounded border border-sky-400/35 bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-100 hover:border-sky-300/65">add rock</button>
            <button type="button" onClick={resetLot} className="rounded border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-100/80">reset</button>
            <button type="button" onClick={saveToBackend} disabled={isSaving} className="rounded border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100 hover:border-emerald-300/65 disabled:opacity-60">{isSaving ? "saving" : "save /api/houses"}</button>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-100/45">save format: rocks: [&#123;x, y, size, color&#125;]</p>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-100/55">{message}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300/75">lot preview</h2>
          <div className="relative h-72 overflow-hidden rounded-lg border border-sky-300/20 bg-[linear-gradient(180deg,#041428_0%,#08233c_56%,#0e2530_56%,#102a34_100%)]">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-[radial-gradient(circle_at_50%_0%,rgba(30,50,40,0.65),rgba(10,18,20,0.95))]" />
            {rocks.map((rock, index) => (
              <div
                key={`${rock.x}-${rock.y}-${rock.size}-${rock.color}-${index}`}
                className="absolute rounded-full border border-black/20 shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
                style={{
                  left: `${rock.x}%`,
                  top: `${rock.y}%`,
                  width: `${rock.size}px`,
                  height: `${Math.max(10, rock.size * 0.72)}px`,
                  backgroundColor: rock.color,
                  transform: "translate(-50%, -50%)",
                }}
                title={`rock ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300/75">payload</h2>
          <pre className="overflow-x-auto rounded border border-white/10 bg-black/40 p-4 text-xs leading-6 text-amber-100/80">{payload}</pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <h2 className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300/75">recent backend saves</h2>
          <div className="space-y-3 text-sm text-amber-100/75">
            {savedHouses.length ? savedHouses.map((house) => (
              <button
                key={house.id}
                type="button"
                onClick={() => {
                  setRocks(house.rocks);
                  setMessage(`loaded save from ${new Date(house.createdAt).toLocaleString()}`);
                }}
                className="block w-full rounded border border-white/10 bg-black/35 px-3 py-3 text-left hover:border-sky-300/45"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-amber-100/55">{new Date(house.createdAt).toLocaleString()}</div>
                <div className="mt-1 text-sm text-amber-100/80">{house.rocks.length} rocks</div>
              </button>
            )) : <p className="text-sm text-amber-100/55">No backend house saves yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
