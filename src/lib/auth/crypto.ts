import crypto from "crypto";

const SECRET = process.env.OTP_HASH_SECRET || "dev-secret";

// OTPコード・セッショントークンをHMAC-SHA256でハッシュ化（平文は保存しない）
export function hashToken(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

// n桁の数字コードを生成（先頭0も許容）
export function generateNumericCode(digits: number): string {
  const max = 10 ** digits;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(digits, "0");
}

// セッション用の不透明トークン（32バイト）
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// タイミング攻撃に強い比較
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
