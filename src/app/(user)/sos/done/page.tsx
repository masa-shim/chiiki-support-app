"use client";
import { useRouter } from "next/navigation";

export default function SosDonePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white flex flex-col p-6 justify-center items-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-5xl mb-6 shadow-inner">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">送信しました</h1>
      <p className="text-center text-slate-600 font-bold leading-relaxed mb-12">
        ご相談を受け付けました。
        <br />
        <br />
        内容を確認し、
        <br />
        <span className="text-blue-600">
          後日スタッフより
          <br />
          お電話でご連絡いたします。
        </span>
        <br />
        <br />
        （※数日かかる場合がございます）
      </p>
      <button
        onClick={() => router.push("/home")}
        className="w-full max-w-md bg-slate-200 text-slate-800 font-bold py-4 rounded-xl text-lg shadow-sm"
      >
        ホーム画面にもどる
      </button>
    </div>
  );
}
