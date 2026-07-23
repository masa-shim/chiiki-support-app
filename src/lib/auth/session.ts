import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSessionToken, hashToken } from "@/lib/auth/crypto";

type Subject = "user" | "admin";

const COOKIE = { user: "user_session", admin: "admin_session" } as const;
const TTL_DAYS = { user: 30, admin: 0.333 } as const; // 管理者は約8時間

// セッションを発行しCookieを設定
export async function createSession(subjectType: Subject, subjectId: string) {
  const db = supabaseAdmin();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + TTL_DAYS[subjectType] * 86400 * 1000);

  await db.from("sessions").insert({
    subject_type: subjectType,
    subject_id: subjectId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
  });

  cookies().set(COOKIE[subjectType], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Cookieのセッションを検証し subject_id を返す（無効なら null）
export async function getSession(subjectType: Subject): Promise<string | null> {
  const token = cookies().get(COOKIE[subjectType])?.value;
  if (!token) return null;
  const db = supabaseAdmin();
  const { data } = await db
    .from("sessions")
    .select("subject_id, expires_at")
    .eq("subject_type", subjectType)
    .eq("token_hash", hashToken(token))
    .single();
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  return data.subject_id as string;
}

export async function destroySession(subjectType: Subject) {
  const token = cookies().get(COOKIE[subjectType])?.value;
  if (token) {
    const db = supabaseAdmin();
    await db.from("sessions").delete().eq("token_hash", hashToken(token));
  }
  cookies().delete(COOKIE[subjectType]);
}
