"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const otpId = params.get("otpId") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "エラーが発生しました");
      return;
    }
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-slate-50">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✉
        </div>
        <h1 className="text-2xl font-bold text-slate-800">番号の確認</h1>
        <p className="text-sm text-slate-600 mt-2">
          携帯電話のショートメッセージ（SMS）に届いた
          <br />
          <span className="font-bold text-red-600">4桁の数字</span>を入力してください。
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="0 0 0 0"
          className="w-4/5 p-4 text-4xl text-center tracking-[0.5em] border-b-4 border-gray-400 bg-transparent focus:border-blue-600 focus:outline-none mb-8 font-bold"
        />

        {error && <p className="text-red-600 font-bold mb-4">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || code.length < 4}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
        >
          {loading ? "確認中..." : "確認してはじめる"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
