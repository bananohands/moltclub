import { env } from "@/lib/env";

export const PORTRAITS_BUCKET = "portraits";

export function getPortraitUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${env.supabaseUrl()}/storage/v1/object/public/${PORTRAITS_BUCKET}/${path}`;
}
