"use client";
import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyInner() {
  const router = useRouter();
  const otpId = useSearchParams().get("otpId") ?? "";
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(i: number, v: string) {
    const c = v.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  async function submit() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, code: digits.join("") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "エラーが発生しました");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md border border-gray-100 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 p-4 rounded-full mb-6 text-3xl">✉</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">2段階認証</h1>
        <p className="text-sm text-slate-600 mb-8">
          登録されたメールアドレスに送信された
          <br />
          <span className="font-bold text-slate-800">6桁の認証コード</span>を入力してください。
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          ))}
        </div>

        {error && <p className="text-red-600 font-bold mb-4">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || digits.some((d) => !d)}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "認証中..." : "認証してログイン"}
        </button>
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
