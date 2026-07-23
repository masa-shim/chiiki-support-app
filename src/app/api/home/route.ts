import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const userId = await getSession("user");
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: user } = await db
    .from("users")
    .select("name, region_id, regions(name)")
    .eq("id", userId)
    .single();

  const nowIso = new Date().toISOString();

  // ユーザーの地域に一致する、現在有効なお知らせ
  const { data: announcements } = await db
    .from("announcements")
    .select("category, body")
    .eq("region_id", user?.region_id)
    .lte("published_at", nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("published_at", { ascending: false })
    .limit(5);

  // 次回イベント（ユーザーの地域 or 全域）
  const { data: events } = await db
    .from("events")
    .select("id, title, starts_at, location, region_id")
    .gte("starts_at", nowIso)
    .or(`region_id.is.null,region_id.eq.${user?.region_id}`)
    .order("starts_at", { ascending: true })
    .limit(1);

  const nextEvent = events?.[0] ?? null;
  let joined = false;
  if (nextEvent) {
    const { data: ep } = await db
      .from("event_participants")
      .select("id")
      .eq("event_id", nextEvent.id)
      .eq("user_id", userId)
      .maybeSingle();
    joined = !!ep;
  }

  return NextResponse.json({
    user: { name: user?.name, region: (user as any)?.regions?.name ?? null },
    announcements: announcements ?? [],
    nextEvent: nextEvent
      ? {
          id: nextEvent.id,
          title: nextEvent.title,
          startsAt: nextEvent.starts_at,
          location: nextEvent.location,
          joined,
        }
      : null,
  });
}
