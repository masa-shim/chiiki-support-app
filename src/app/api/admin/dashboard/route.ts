import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const adminId = await getSession("admin");
  if (!adminId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const db = supabaseAdmin();

  // 未対応の相談
  const { data: consults, count } = await db
    .from("consultations")
    .select("id, created_at, audio_path, users(name)", { count: "exact" })
    .eq("status", "untouched")
    .order("created_at", { ascending: false })
    .limit(5);

  // 次回イベントと参加状況
  const nowIso = new Date().toISOString();
  const { data: events } = await db
    .from("events")
    .select("id, title, starts_at, location")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(1);
  const nextEvent = events?.[0] ?? null;

  let eventSummary = null;
  if (nextEvent) {
    const { data: parts } = await db
      .from("event_participants")
      .select("pre_consultation_note")
      .eq("event_id", nextEvent.id);
    eventSummary = {
      title: nextEvent.title,
      startsAt: nextEvent.starts_at,
      location: nextEvent.location,
      participantCount: parts?.length ?? 0,
      preConsultCount: parts?.filter((p) => p.pre_consultation_note).length ?? 0,
    };
  }

  // 地域別 配信中お知らせ
  const { data: regions } = await db.from("regions").select("id, name").order("sort_order");
  const { data: anns } = await db
    .from("announcements")
    .select("region_id, category, body")
    .lte("published_at", nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
  const announcementsByRegion = (regions ?? []).map((r) => ({
    region: r.name,
    items: (anns ?? []).filter((a) => a.region_id === r.id).map((a) => ({ category: a.category, body: a.body })),
  }));

  return NextResponse.json({
    openConsultations: {
      count: count ?? 0,
      items: (consults ?? []).map((c) => ({
        id: c.id,
        userName: (c as any).users?.name ?? "不明",
        createdAt: c.created_at,
        hasAudio: !!c.audio_path,
      })),
    },
    nextEvent: eventSummary,
    announcementsByRegion,
  });
}
