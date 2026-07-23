import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession("user");
  return NextResponse.json({ ok: true });
}
