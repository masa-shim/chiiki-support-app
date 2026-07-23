"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, phone }),
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
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-slate-50">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
          ＋
        </div>
        <h1 className="text-2xl font-bold text-slate-800">はじめての登録</h1>
        <p className="text-sm text-slate-600 mt-2">
          次回からは自動でログインします。
          <br />
          パスワードは不要です。
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <Field label="お名前" value={name} onChange={setName} placeholder="例：那珂川 太郎" />
        <Field label="ご住所" value={address} onChange={setAddress} placeholder="例：那珂川市〇〇町1-2-3" />
        <Field label="携帯電話番号" value={phone} onChange={setPhone} placeholder="09012345678" type="tel" />

        {error && <p className="text-red-600 font-bold text-center">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg mt-4 disabled:opacity-50"
        >
          {loading ? "送信中..." : "SMSで確認番号を受け取る"}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-center text-slate-600 mb-2">以前ご利用だった方はこちら</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-white text-emerald-600 border-2 border-emerald-500 font-bold py-3 rounded-xl shadow-sm"
        >
          すでに登録済みの方
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        inputMode={type === "tel" ? "numeric" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
