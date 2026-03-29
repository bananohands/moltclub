import { getSupabasePublicServer } from "@/lib/supabase/server";

function normalizeText(value: string | null | undefined) {
  if (!value) return value ?? null;
  return value
    .replaceAll("ΓÇö", "—")
    .replaceAll("ΓÇÖ", "’")
    .replaceAll("ΓÇ£", "“")
    .replaceAll("ΓÇ¥", "”")
    .replaceAll("Â", "");
}

function normalizeGroup<T extends Record<string, unknown> | null>(group: T): T {
  if (!group) return group;
  return {
    ...group,
    name: normalizeText(typeof group.name === "string" ? group.name : null),
    subtitle: normalizeText(typeof group.subtitle === "string" ? group.subtitle : null),
    description: normalizeText(typeof group.description === "string" ? group.description : null),
  } as T;
}

export async function listGroups() {
  const supabase = getSupabasePublicServer();
  const { data, error } = await supabase
    .from("support_groups")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((group) => normalizeGroup(group));
}

export async function getGroupBySlug(slug: string) {
  const supabase = getSupabasePublicServer();
  const { data, error } = await supabase
    .from("support_groups")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return normalizeGroup(data);
}
