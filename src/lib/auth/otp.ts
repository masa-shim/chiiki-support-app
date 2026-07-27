import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateNumericCode, hashToken } from "@/lib/auth/crypto";

type Subject = "user" | "admin";
type Channel = "sms" | "email";
type Purpose = "signup" | "login" | "mfa";

const MAX_ATTEMPTS = 5;

// テスト公開用: TEST_MODE=true のとき、下の固定コードでも認証を通す（本番前に必ずオフ）
const TEST_MODE = true;
const MASTER_CODES: Record<string, string> = { user: "1111", admin: "111111" };

export async function createOtp(params: {
  subjectType: Subject;
  subjectId?: string | null;
  channel: Channel;
  destination: string;
  purpose: Purpose;
  digits: number;
  ttlMinutes: number;
  payload?: Record<string, unknown>;
}): Promise<{ otpId: string; code: string }> {
  const db = supabaseAdmin();
  const code = generateNumericCode(params.digits);
  const expiresAt = new Date(Date.now() + params.ttlMinutes * 60 * 1000).toISOString();

  const { data, error } = await db
    .from("otp_codes")
    .insert({
      subject_type: params.subjectType,
      subject_id: params.subjectId ?? null,
      channel: params.channel,
      destination: params.destination,
      code_hash: hashToken(code),
      purpose: params.purpose,
      payload: params.payload ?? null,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("OTP生成に失敗しました");
  return { otpId: data.id, code };
}

type VerifyResult =
  | { ok: true; row: any }
  | { ok: false; code: "OTP_EXPIRED" | "OTP_INVALID" | "OTP_LOCKED" | "OTP_NOT_FOUND" };

export async function verifyOtp(otpId: string, inputCode: string): Promise<VerifyResult> {
  const db = supabaseAdmin();
  const { data: row } = await db.from("otp_codes").select("*").eq("id", otpId).single();
  if (!row) return { ok: false, code: "OTP_NOT_FOUND" };
  if (row.consumed_at) return { ok: false, code: "OTP_INVALID" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, code: "OTP_LOCKED" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, code: "OTP_EXPIRED" };

  const isMaster = TEST_MODE && inputCode === MASTER_CODES[row.subject_type];
  if (!isMaster && hashToken(inputCode) !== row.code_hash) {
    await db.from("otp_codes").update({ attempts: row.attempts + 1 }).eq("id", otpId);
    return { ok: false, code: "OTP_INVALID" };
  }

  await db.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", otpId);
  return { ok: true, row };
}
