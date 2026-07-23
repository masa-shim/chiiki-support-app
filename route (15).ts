"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "エラーが発生しました");
      return;
    }
    router.push(`/verify?otpId=${data.otpId}`);
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-white">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
          →
        </div>
        <h1 className="text-2xl font-bold text-slate-800">ログイン</h1>
        <p className="text-sm text-slate-600 mt-2">
          以前登録した情報を入力してください。
          <br />
          パスワードは不要です。
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">お名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：那珂川 太郎"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">携帯電話番号</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09012345678"
            className="w-full p-4 text-xl tracking-widest border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-red-600 font-bold text-center">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg mt-8 disabled:opacity-50"
        >
          {loading ? "送信中..." : "SMSで確認番号を受け取る"}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-center text-slate-600 mb-2">初めての方はこちら</p>
        <button
          onClick={() => router.push("/register")}
          className="w-full bg-white text-blue-600 border-2 border-blue-500 font-bold py-3 rounded-xl shadow-sm"
        >
          はじめての登録
        </button>
      </div>
    </div>
  );
}
