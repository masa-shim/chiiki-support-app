import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// 相談ステータス更新・対応記録
export async function PATCH(req: NextRequest) {
  const adminId = await getSession("admin");
  if (!adminId) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "ログインしてください" } }, { status: 401 });
  }
  const { id, status, followUpNote } = await req.json();
  if (!id || !["untouched", "in_progress", "done"].includes(status)) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "入力が不正です" } }, { status: 400 });
  }
  const db = supabaseAdmin();
  const patch: Record<string, unknown> = {
    status,
    assigned_admin_id: adminId,
    follow_up_note: followUpNote ?? null,
  };
  if (status === "done") patch.resolved_at = new Date().toISOString();

  const { error } = await db.from("consultations").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "更新に失敗しました" } }, { status: 500 });
  }
  await db.from("admin_audit_log").insert({ admin_id: adminId, action: "update_consult", target: id });
  return NextResponse.json({ ok: true });
}
