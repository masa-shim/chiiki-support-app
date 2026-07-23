"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "エラーが発生しました");
      return;
    }
    router.push(`/admin/verify?otpId=${data.otpId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-block bg-slate-800 text-white p-3 rounded-lg mb-4 text-2xl">🛡</div>
          <h1 className="text-2xl font-bold text-slate-800">管理者システム ログイン</h1>
          <p className="text-sm text-red-600 mt-2 font-bold bg-red-50 p-2 rounded">
            ※個人情報保護のため、多要素認証が必要です。
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-600 font-bold text-center">{error}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? "確認中..." : "メール認証へ進む →"}
          </button>
        </div>
      </div>
    </div>
  );
}
