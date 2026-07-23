"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Home = {
  user: { name: string; region: string | null };
  announcements: { category: string; body: string }[];
  nextEvent: { id: string; title: string; startsAt: string; location: string; joined: boolean } | null;
};

const CATEGORY_STYLE: Record<string, string> = {
  生活: "bg-blue-50 text-blue-600 border-blue-200",
  防犯: "bg-orange-50 text-orange-600 border-orange-200",
  健康: "bg-green-50 text-green-600 border-green-200",
};

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<Home | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => router.push("/login"));
  }, [router]);

  async function join() {
    if (!data?.nextEvent) return;
    setJoining(true);
    await fetch("/api/events/participate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: data.nextEvent.id }),
    });
    setJoining(false);
    setData({ ...data, nextEvent: { ...data.nextEvent, joined: true } });
  }

  if (!data) return <div className="p-8 text-center text-slate-500">読み込み中...</div>;

  const ev = data.nextEvent;
  const evDate = ev
    ? new Date(ev.startsAt).toLocaleString("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative pb-28">
      <div className="bg-blue-600 text-white p-6 pt-10 rounded-b-3xl shadow-md">
        <p className="text-sm opacity-90">
          {data.user.region ? `${data.user.region}にお住まいの` : "ようこそ"}
        </p>
        <h1 className="text-2xl font-bold mt-1">{data.user.name} さん</h1>
      </div>

      <div className="flex-1 p-5 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 border-b-2 border-blue-100 pb-2 mb-3">
            {data.user.region ?? ""}の今週のお知らせ
          </h2>
          {data.announcements.length === 0 ? (
            <p className="text-slate-500">今週のお知らせはありません。</p>
          ) : (
            <ul className="space-y-4">
              {data.announcements.map((a, i) => (
                <li key={i} className="bg-slate-50 p-3 rounded-lg">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded border bg-white ${
                      CATEGORY_STYLE[a.category] ?? "text-slate-600 border-slate-200"
                    }`}
                  >
                    {a.category}
                  </span>
                  <p className="text-slate-700 font-bold mt-2 leading-tight">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ev && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-slate-800 border-b-2 border-green-100 pb-2 mb-3">
              次回の{ev.title}
            </h2>
            <div className="text-center mb-4">
              <p className="text-slate-500 text-sm">日時</p>
              <p className="text-xl font-bold text-slate-800">{evDate}〜</p>
              <p className="text-slate-500 text-sm mt-1">場所: {ev.location}</p>
            </div>
            {ev.joined ? (
              <p className="w-full text-center bg-green-100 text-green-700 font-bold py-4 rounded-xl text-lg">
                参加申込ずみです
              </p>
            ) : (
              <button
                onClick={join}
                disabled={joining}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg shadow disabled:opacity-50"
              >
                {joining ? "申込中..." : "参加する"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
        <button
          onClick={() => router.push("/sos")}
          className="w-full bg-orange-500 text-white font-bold py-5 rounded-2xl text-xl shadow-xl border-4 border-white"
        >
          相談する
        </button>
      </div>
    </div>
  );
}
