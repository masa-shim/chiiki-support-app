import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// 地域お知らせの入稿（週1）
export async function POST(req: NextRequest) {
  const adminId = await getSession("admin");
  if (!adminId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const { regionId, category, body, expiresAt } = await req.json();
  if (!regionId || !category || !body) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が足りません" } }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("announcements")
    .insert({ region_id: regionId, category, body, expires_at: expiresAt ?? null, created_by: adminId })
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "登録に失敗しました" } }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
