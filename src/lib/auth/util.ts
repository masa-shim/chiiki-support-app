// 日本の携帯番号をE.164（+81...）へ正規化。保存はこの形式で統一する。
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return "+81" + digits.slice(1);
  if (digits.startsWith("81")) return "+" + digits;
  if (raw.startsWith("+")) return raw.replace(/[^0-9+]/g, "");
  return "+81" + digits;
}

// 表示用（090-1234-5678）に整形
export function formatPhoneForDisplay(e164: string): string {
  const d = e164.replace("+81", "0").replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return d;
}

// 最終ログインからの経過日数
export function inactiveDays(lastLoginAt: string | null): number {
  if (!lastLoginAt) return Infinity;
  const diff = Date.now() - new Date(lastLoginAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
