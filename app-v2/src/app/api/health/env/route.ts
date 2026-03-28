import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export function GET() {
  const status = {
    appUrl: !!env.appUrl(),
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    sessionSecret: !!process.env.SESSION_SECRET,
  };

  return NextResponse.json(status, { status: Object.values(status).every(Boolean) ? 200 : 503 });
}
