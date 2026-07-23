"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SosPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        upload(new Blob(chunksRef.current, { type: rec.mimeType }));
      };
      rec.start();
      recorderRef.current = rec;
      startedAtRef.current = Date.now();
      setRecording(true);
    } catch {
      setError("マイクを使えませんでした。設定をご確認ください。");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function upload(blob: Blob) {
    setUploading(true);
    const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
    const form = new FormData();
    form.append("audio", blob, "sos.webm");
    form.append("durationSeconds", String(duration));
    const res = await fetch("/api/consultations", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      setError("送信に失敗しました。もう一度お試しください。");
      return;
    }
    router.push("/sos/done");
  }

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col p-6">
      <div className="pt-10 flex justify-between items-center text-white">
        <button onClick={() => router.push("/home")} className="p-2 text-2xl">
          ✕
        </button>
        <span className="font-bold text-lg">相談する</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-white text-center text-lg font-bold mb-12">
          スマホやパソコンで
          <br />
          困っていることを、
          <br />
          声で教えてください。
        </p>

        <div className="relative w-48 h-48 mb-12">
          {recording && <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-ping" />}
          <div className="absolute inset-4 bg-orange-500 rounded-full opacity-50" />
          <button
            onMouseDown={start}
            onMouseUp={stop}
            onTouchStart={start}
            onTouchEnd={stop}
            disabled={uploading}
            className="absolute inset-8 bg-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white text-5xl active:scale-95 transition-transform disabled:opacity-50"
          >
            🎤
          </button>
        </div>

        {error && <p className="text-red-300 font-bold mb-4 text-center">{error}</p>}

        <p className="text-orange-200 text-center font-bold bg-slate-700 px-6 py-3 rounded-full">
          {uploading ? "送信しています..." : recording ? "話してください（指を離すと送信）" : "ボタンを押しながら話す"}
        </p>
      </div>
    </div>
  );
}
