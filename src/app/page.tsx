import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

// 入口: ログイン済みならホーム、未ログインなら登録画面へ
export default async function Index() {
  const userId = await getSession("user");
  redirect(userId ? "/home" : "/register");
}
