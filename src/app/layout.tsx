import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "地域コミュニティ＆サポート",
  description: "高齢者のための地域情報・相談アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
