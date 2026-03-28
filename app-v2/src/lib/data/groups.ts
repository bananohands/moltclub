import { getSupabasePublicServer } from "@/lib/supabase/server";

export async function listGroups() {
  const supabase = getSupabasePublicServer();
  const { data, error } = await supabase
    .from("support_groups")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
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
  return data;
}
