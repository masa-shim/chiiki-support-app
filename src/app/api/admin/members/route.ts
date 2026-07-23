import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { inactiveDays, formatPhoneForDisplay } from "@/lib/auth/util";

export async function GET(req: NextRequest) {
  const adminId = await getSession("admin");
  if (!adminId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const alertDays = Number(url.searchParams.get("alertDays") ?? 7);
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  const db = supabaseAdmin();
  let q = db
    .from("users")
    .select("id, name, phone, address, last_login_at, regions(name)", { count: "exact" })
    .eq("status", "active");

  if (query) {
    q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
  }
  q = q.order("last_login_at", { ascending: true, nullsFirst: true }).range(from, from + pageSize - 1);

  const { data, count } = await q;

  const members = (data ?? []).map((u) => {
    const days = inactiveDays(u.last_login_at);
    return {
      id: u.id,
      name: u.name,
      region: (u as any).regions?.name ?? u.address,
      phone: formatPhoneForDisplay(u.phone),
      lastLoginAt: u.last_login_at,
      inactiveDays: days === Infinity ? null : days,
      alert: days >= alertDays,
    };
  });

  return NextResponse.json({ total: count ?? 0, page, pageSize, members });
}
