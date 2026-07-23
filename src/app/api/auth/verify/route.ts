import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

const ERR: Record<string, string> = {
  OTP_EXPIRED: "番号の有効期限が切れました。もう一度お試しください。",
  OTP_INVALID: "番号が正しくありません。",
  OTP_LOCKED: "入力回数が上限に達しました。最初からやり直してください。",
  OTP_NOT_FOUND: "番号が正しくありません。",
};

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
  // ログインの不一致ダミーは認証させない
  if (row.payload?.dummy) {
    return NextResponse.json({ error: { code: "OTP_INVALID", message: ERR.OTP_INVALID } }, { status: 400 });
  }

  const db = supabaseAdmin();
  let userId = row.subject_id as string | null;

  // 新規登録: ここで会員レコードを確定
  if (row.purpose === "signup") {
    const p = row.payload as { name: string; address: string; phone: string };
    // 住所文字列から地域を推定（"那珂川市" 等が含まれる地域に紐付け）
    const { data: regions } = await db.from("regions").select("id, name");
    const region = regions?.find((r) => p.address.includes(r.name));
    const { data: created, error } = await db
      .from("users")
      .insert({
        name: p.name,
        phone: p.phone,
        address: p.address,
        region_id: region?.id ?? null,
        last_login_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "登録に失敗しました" } }, { status: 500 });
    }
    userId = created.id;
  } else {
    // ログイン: 最終ログインを更新（安否確認の基準）
    await db.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", userId);
  }

  if (!userId) {
    return NextResponse.json({ error: { code: "OTP_INVALID", message: ERR.OTP_INVALID } }, { status: 400 });
  }

  await createSession("user", userId);

  const { data: user } = await db
    .from("users")
    .select("id, name, regions(name)")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    user: { id: userId, name: user?.name, region: (user as any)?.regions?.name ?? null },
  });
}
