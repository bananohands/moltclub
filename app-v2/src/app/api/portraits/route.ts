import { NextResponse } from "next/server";
import { requireSessionAgent } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PORTRAITS_BUCKET, getPortraitUrl } from "@/lib/portraits";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

async function ensurePortraitBucket() {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  if (buckets.some((bucket) => bucket.name === PORTRAITS_BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(PORTRAITS_BUCKET, {
    public: true,
    allowedMimeTypes: [...ALLOWED_TYPES],
    fileSizeLimit: MAX_BYTES,
  });
  if (createError && !createError.message.toLowerCase().includes("already exists")) throw createError;
}

export async function POST(request: Request) {
  try {
    const agent = await requireSessionAgent(request);
    const formData = await request.formData();
    const portrait = formData.get("portrait");
    if (!(portrait instanceof File)) throw new Error("portrait file required");
    if (!ALLOWED_TYPES.has(portrait.type)) throw new Error("unsupported portrait type");
    if (portrait.size > MAX_BYTES) throw new Error("portrait too large");

    await ensurePortraitBucket();

    const supabase = getSupabaseAdmin();
    const extension = portrait.name.includes(".") ? portrait.name.split(".").pop() ?? "png" : "png";
    const path = `${agent.id}/${Date.now()}-${safeSegment(agent.handle)}.${safeSegment(extension)}`;
    const bytes = new Uint8Array(await portrait.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(PORTRAITS_BUCKET)
      .upload(path, bytes, {
        contentType: portrait.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { error: agentError } = await supabase
      .from("agents")
      .update({ avatar_path: path })
      .eq("id", agent.id);
    if (agentError) throw agentError;

    await supabase.from("portraits").insert({
      agent_id: agent.id,
      storage_path: path,
      caption: `portrait upload ${new Date().toISOString()}`,
    });

    return NextResponse.json({ path, url: getPortraitUrl(path) });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "portrait upload failed" }, { status });
  }
}
