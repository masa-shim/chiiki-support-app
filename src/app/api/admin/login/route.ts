import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/sms/send";

// 第1要素: メール＋パスワード検証 → 成功時に6桁コードをメール送信
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が足りません" } }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data: admin } = await db
    .from("admins")
    .select("id, email, password_hash, is_active")
    .eq("email", email)
    .maybeSingle();

  const passOk = admin?.is_active && (await bcrypt.compare(password, admin.password_hash));

  // 成功時のみ実際にコードを発行・送信。失敗でも同じレスポンス（存在秘匿）。
  if (passOk) {
    const { otpId, code } = await createOtp({
      subjectType: "admin",
      subjectId: admin!.id,
      channel: "email",
      destination: email,
      purpose: "mfa",
      digits: 6,
      ttlMinutes: 10,
    });
    await sendEmail(email, "管理システム 認証コード", `認証コードは ${code} です。（10分間有効）`);
    return NextResponse.json({ otpId, message: "メールに認証コードを送信しました" });
  }

  const { otpId } = await createOtp({
    subjectType: "admin",
    channel: "email",
    destination: email,
    purpose: "mfa",
    digits: 6,
    ttlMinutes: 10,
    payload: { dummy: true },
  });
  return NextResponse.json({ otpId, message: "メールに認証コードを送信しました" });
}
