"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";

type Member = {
  id: string;
  name: string;
  region: string;
  phone: string;
  lastLoginAt: string | null;
  inactiveDays: number | null;
  alert: boolean;
};

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: number, q: string) => {
      setLoading(true);
      const res = await fetch(`/api/admin/members?page=${p}&query=${encodeURIComponent(q)}`);
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setMembers(data.members);
      setTotal(data.total);
      setLoading(false);
    },
    [router]
  );

  useEffect(() => {
    load(page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function lastLoginLabel(m: Member) {
    if (m.alert) return `${m.inactiveDays ?? "7"}日以上 未アクセス`;
    if (m.inactiveDays === 0) return "本日";
    if (m.inactiveDays === null) return "未ログイン";
    return `${m.inactiveDays}日前`;
  }

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">会員管理</h1>
            <p className="text-sm text-slate-600 mt-1">登録者の確認と利用状況（安否）の把握を行います。</p>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, query))}
              placeholder="名前や電話番号で検索..."
              className="p-2 border border-gray-300 rounded-lg text-sm w-64 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setPage(1);
                load(1, query);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
            >
              検索
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-gray-200 text-slate-600">
                <th className="p-4 font-bold text-sm">氏名</th>
                <th className="p-4 font-bold text-sm">地域（住所）</th>
                <th className="p-4 font-bold text-sm">電話番号</th>
                <th className="p-4 font-bold text-sm">最終ログイン（安否確認）</th>
                <th className="p-4 font-bold text-sm text-center">アクション</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    読み込み中...
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className={`border-b border-gray-100 hover:bg-slate-50 ${m.alert ? "bg-red-50" : ""}`}>
                    <td className="p-4 font-bold text-slate-800">{m.name}</td>
                    <td className="p-4 text-slate-600">{m.region}</td>
                    <td className="p-4 text-slate-600">{m.phone}</td>
                    <td className="p-4">
                      <span className={`font-bold ${m.alert ? "text-red-600" : "text-green-600"}`}>
                        {m.alert ? "⚠ " : "● "}
                        {lastLoginLabel(m)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {m.alert ? (
                        <button className="bg-red-100 text-red-700 border border-red-300 px-3 py-1 rounded hover:bg-red-200 text-xs font-bold">
                          状況確認
                        </button>
                      ) : (
                        <button className="border border-slate-300 text-slate-700 px-3 py-1 rounded hover:bg-slate-100 text-xs font-bold">
                          詳細を見る
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-slate-500">
            <span>全 {total} 名</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                前へ
              </button>
              <button
                onClick={() => setPage((p) => (p * 20 < total ? p + 1 : p))}
                disabled={page * 20 >= total}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
