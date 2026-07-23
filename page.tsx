// 管理者アカウントを作成するスクリプト。
// 使い方: node scripts/seed-admin.mjs "admin@example.com" "パスワード" "運営 花子"
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const [, , email, password, name] = process.argv;
if (!email || !password || !name) {
  console.error('使い方: node scripts/seed-admin.mjs "email" "password" "表示名"');
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const hash = await bcrypt.hash(password, 12);
const { error } = await db.from("admins").insert({
  email, password_hash: hash, display_name: name, role: "admin",
});
if (error) { console.error(error); process.exit(1); }
console.log("管理者を作成しました:", email);
