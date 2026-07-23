import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createOtp } from "@/lib/auth/otp";
import { sendSms } from "@/lib/sms/send";
import { normalizePhone } from "@/lib/auth/util";

// 名前＋電話番号でログイン申込。存在秘匿のため、
// 一致しなくても同じ成功レスポンスを返す（SMSは一致時のみ送る）。
export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が足りません" } }, { status: 400 });
  }
  const e164 = normalizePhone(phone);
  const db = supabaseAdmin();

  const { data: user } = await db
    .from("users")
    .select("id, name")
    .eq("phone", e164)
    .eq("status", "active")
    .maybeSingle();

  // 一致時のみOTPを生成・送信。ただしotpIdは常に返す（ダミー含む）。
  if (user && user.name === name) {
    const { otpId, code } = await createOtp({
      subjectType: "user",
      subjectId: user.id,
      channel: "sms",
      destination: e164,
      purpose: "login",
      digits: 4,
      ttlMinutes: 5,
    });
    await sendSms(e164, `確認番号は ${code} です。（地域サポートアプリ）`);
    return NextResponse.json({ otpId, channel: "sms", message: "確認番号を送信しました" });
  }

  // 不一致でもダミーOTPを作り、レスポンスを区別できないようにする
  const { otpId } = await createOtp({
    subjectType: "user",
    channel: "sms",
    destination: e164,
    purpose: "login",
    digits: 4,
    ttlMinutes: 5,
    payload: { dummy: true },
  });
  return NextResponse.json({ otpId, channel: "sms", message: "確認番号を送信しました" });
}
