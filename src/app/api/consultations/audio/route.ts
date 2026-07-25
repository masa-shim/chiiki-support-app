import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// 相談音声の一時再生リンク（署名付きURL・5分間有効）を発行する
export async function GET(req: NextRequest) {
  const adminId = await getSession("admin");
  if (!adminId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "idがありません" } }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data: consult } = await db
    .from("consultations")
    .select("audio_path")
    .eq("id", id)
    .single();
  if (!consult?.audio_path) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "音声がありません" } }, { status: 404 });
  }
  const { data, error } = await db.storage
    .from("consultations")
    .createSignedUrl(consult.audio_path, 300);
  if (error || !data) {
    return NextResponse.json({ error: { code: "SIGN_FAILED", message: "リンク発行に失敗しました" } }, { status: 500 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
