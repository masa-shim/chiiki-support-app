import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const userId = await getSession("user");
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const { eventId, preConsultationNote } = await req.json();
  if (!eventId) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "イベントが指定されていません" } }, { status: 400 });
  }
  const db = supabaseAdmin();
  // 二重申込は unique 制約で弾かれるため upsert 的に処理
  await db
    .from("event_participants")
    .upsert(
      { event_id: eventId, user_id: userId, pre_consultation_note: preConsultationNote ?? null },
      { onConflict: "event_id,user_id" }
    );
  return NextResponse.json({ joined: true });
}
