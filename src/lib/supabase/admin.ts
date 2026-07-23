import { createClient } from "@supabase/supabase-js";

// サーバ専用: service_role キーでRLSを迂回する。絶対にクライアントへ渡さない。
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
