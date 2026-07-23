import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createOtp } from "@/lib/auth/otp";
import { sendSms } from "@/lib/sms/send";
import { normalizePhone } from "@/lib/auth/util";

export async function POST(req: NextRequest) {
  const { name, address, phone } = await req.json();
  if (!name || !address || !phone) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が足りません" } }, { status: 400 });
  }
  const e164 = normalizePhone(phone);
  const db = supabaseAdmin();

  // 既に登録済みなら案内
  const { data: existing } = await db.from("users").select("id").eq("phone", e164).maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: { code: "ALREADY_REGISTERED", message: "この電話番号は登録済みです。ログインしてください。" } },
      { status: 409 }
    );
  }

  // 登録情報をpayloadに一時保持し、verify成功時に確定させる
  const { otpId, code } = await createOtp({
    subjectType: "user",
    channel: "sms",
    destination: e164,
    purpose: "signup",
    digits: 4,
    ttlMinutes: 5,
    payload: { name, address, phone: e164 },
  });
  await sendSms(e164, `確認番号は ${code} です。（地域サポートアプリ）`);

  return NextResponse.json({ otpId, channel: "sms", message: "確認番号を送信しました" });
}
