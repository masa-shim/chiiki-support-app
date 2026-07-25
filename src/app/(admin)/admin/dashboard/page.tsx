"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";

type Dashboard = {
  openConsultations: {
    count: number;
    items: { id: string; userName: string; createdAt: string; hasAudio: boolean }[];
  };
  nextEvent: {
    title: string;
    startsAt: string;
    location: string;
    participantCount: number;
    preConsultCount: number;
  } | null;
  announcementsByRegion: { region: string; items: { category: string; body: string }[] }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [regionIdx, setRegionIdx] = useState(0);
  const [audio, setAudio] = useState<Record<string, string>>({});
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => router.push("/admin/login"));
  }, [router]);

  async function playAudio(id: string) {
    setLoadingAudio(id);
    try {
      const res = await fetch(`/api/admin/consultations/audio?id=${id}`);
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.url) {
        setAudio((a) => ({ ...a, [id]: d.url }));
      } else {
        alert(d?.error?.message ?? `再生できませんでした（${res.status}）`);
      }
    } catch {
      alert("再生できませんでした（通信エラー）");
    } finally {
      setLoadingAudio(null);
    }
  }

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">ダッシュボード</h1>
        {!data ? (
          <p className="text-slate-500">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">未対応の相談</h2>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                  {data.openConsultations.count}件
                </span>
              </div>
              <ul className="space-y-3">
                {data.openConsultations.items.map((c) => (
                  <li key={c.id} className="border border-gray-100 p-3 rounded hover:bg-slate-50">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{c.userName} 様</span>
                      <span className="text-slate-500">
                        {new Date(c.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {c.hasAudio && (
                      <div className="mt-2">
                        {audio[c.id] ? (
                          <audio controls autoPlay src={audio[c.id]} className="w-full mt-1">
                            お使いのブラウザは音声再生に対応していません。
                          </audio>
                        ) : (
                          <button
                            onClick={() => playAudio(c.id)}
                            disabled={loadingAudio === c.id}
                            className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            {loadingAudio === c.id ? "読み込み中..." : "▶ 音声を再生"}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
                {data.openConsultations.items.length === 0 && (
                  <li className="text-slate-500 text-sm">未対応の相談はありません。</li>
                )}
              </ul>
            </section>

            <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">次回イベント（スマホ教室）</h2>
              {data.nextEvent ? (
                <>
                  <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-slate-500 text-sm">
                      {new Date(data.nextEvent.startsAt).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}{" "}
                      {data.nextEvent.location}
                    </p>
                    <div className="text-4xl font-bold text-slate-800 mt-2">
                      {data.nextEvent.participantCount}
                      <span className="text-lg text-slate-500 font-normal">名 参加予定</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    うち{data.nextEvent.preConsultCount}名が事前相談あり
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-sm">予定されているイベントはありません。</p>
              )}
            </section>

            <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">現在配信中のお知らせ</h2>
                <select
                  value={regionIdx}
                  onChange={(e) => setRegionIdx(Number(e.target.value))}
                  className="border border-gray-300 rounded-md p-2 text-sm bg-gray-50 font-bold focus:outline-none focus:border-blue-500"
                >
                  {data.announcementsByRegion.map((r, i) => (
                    <option key={i} value={i}>
                      {r.region} 向け
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 border-2 border-blue-100 rounded bg-blue-50">
                {data.announcementsByRegion[regionIdx]?.items.length ? (
                  <ul className="text-sm font-bold text-gray-700 leading-relaxed list-disc pl-5">
                    {data.announcementsByRegion[regionIdx].items.map((a, i) => (
                      <li key={i}>
                        [{a.category}] {a.body}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">この地域の配信はありません。</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
