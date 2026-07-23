import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// 音声SOSの送信。multipart/form-data で audio を受け取り Storage に保存する。
export async function POST(req: NextRequest) {
  const userId = await getSession("user");
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }

  const form = await req.formData();
  const audio = form.get("audio") as File | null;
  const durationSeconds = Number(form.get("durationSeconds") ?? 0) || null;

  const db = supabaseAdmin();
  let audioPath: string | null = null;

  if (audio) {
    const ext = audio.type.includes("mp4") ? "m4a" : "webm";
    audioPath = `${userId}/${Date.now()}.${ext}`;
    const buf = Buffer.from(await audio.arrayBuffer());
    const { error: upErr } = await db.storage
      .from("consultations")
      .upload(audioPath, buf, { contentType: audio.type, upsert: false });
    if (upErr) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "音声の保存に失敗しました" } }, { status: 500 });
    }
  }

  const { data, error } = await db
    .from("consultations")
    .insert({ user_id: userId, audio_path: audioPath, duration_seconds: durationSeconds, status: "untouched" })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "送信に失敗しました" } }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, message: "送信しました。後日スタッフよりお電話します。" });
}
