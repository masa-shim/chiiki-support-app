import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

const ERR: Record<string, string> = {
  OTP_EXPIRED: "コードの有効期限が切れました。",
  OTP_INVALID: "コードが正しくありません。",
  OTP_LOCKED: "入力回数が上限に達しました。最初からやり直してください。",
  OTP_NOT_FOUND: "コードが正しくありません。",
};

// 第2要素: 6桁コード検証 → 管理者セッション発行
export async function POST(req: NextRequest) {
  const { otpId, code } = await req.json();
  if (!otpId || !code) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が足りません" } }, { status: 400 });
  }

  const result = await verifyOtp(otpId, code);
  if (!result.ok) {
    return NextResponse.json({ error: { code: result.code, message: ERR[result.code] } }, { status: 400 });
  }
  const row = result.row;
  if (row.payload?.dummy || row.subject_type !== "admin" || !row.subject_id) {
    return NextResponse.json({ error: { code: "OTP_INVALID", message: ERR.OTP_INVALID } }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: admin } = await db
    .from("admins")
    .select("id, display_name, role")
    .eq("id", row.subject_id)
    .single();
  if (!admin) {
    return NextResponse.json({ error: { code: "OTP_INVALID", message: ERR.OTP_INVALID } }, { status: 400 });
  }

  await createSession("admin", admin.id);
  await db.from("admin_audit_log").insert({ admin_id: admin.id, action: "login" });

  return NextResponse.json({ admin: { id: admin.id, name: admin.display_name, role: admin.role } });
}
