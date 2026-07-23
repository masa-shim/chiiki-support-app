"use client";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "ダッシュボード" },
  { href: "/admin/members", label: "会員管理" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-center border-b border-slate-700">
          <h1 className="text-xl font-bold">管理システム</h1>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <button
                key={n.href}
                onClick={() => router.push(n.href)}
                className={`block w-full text-left px-6 py-3 ${
                  active
                    ? "bg-slate-900 border-l-4 border-blue-500 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={logout} className="w-full text-left text-sm text-slate-400 hover:text-white">
            ログアウト
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
