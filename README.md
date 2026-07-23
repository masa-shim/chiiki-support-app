# 地域コミュニティ＆サポートアプリ

高齢者向けの地域情報・相談アプリと、運営スタッフ向けの管理システム。
「情報介護」をコンセプトに、高齢者が迷わないシンプルなUIと、個人情報を守る
多要素認証・パスワードレス設計を両立する。

## 技術スタック

- フロントエンド / バックエンド: **Next.js 14 (App Router) + TypeScript**
- スタイリング: **Tailwind CSS**
- データベース / 認証基盤 / ストレージ: **Supabase (PostgreSQL)**
- SMS送信（ユーザーOTP）: **Twilio**
- メール送信（管理者OTP）: **Resend**
- ホスティング: **Vercel（フロント）＋ Supabase（バック）**

## ディレクトリ構成

```
chiiki-support-app/
├─ supabase/schema.sql          # DBスキーマ + Row Level Security
├─ docs/
│  ├─ api-design.md             # API仕様
│  └─ auth-flow.md              # 認証フロー詳細設計
├─ scripts/seed-admin.mjs       # 管理者アカウント作成
└─ src/
   ├─ app/
   │  ├─ (user)/                # 高齢者向け画面（登録/ログイン/OTP/ホーム/SOS）
   │  ├─ (admin)/admin/         # 管理者向け画面（ログイン/2FA/ダッシュボード/会員管理）
   │  └─ api/                   # Route Handler（サーバ側処理）
   ├─ components/               # 共通UI
   └─ lib/
      ├─ supabase/admin.ts      # service_roleクライアント（サーバ専用）
      ├─ auth/                  # OTP・セッション・ハッシュ・ユーティリティ
      └─ sms/send.ts            # SMS/メール送信の抽象化
```

## セットアップ手順

### 1. 依存インストール
```bash
npm install
```

### 2. Supabase の準備
1. Supabase プロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行（テーブル・RLS・サンプル地域が作られる）
3. Storage で `consultations` という名前のバケットを作成（Private 推奨）

### 3. 環境変数
`.env.example` を `.env.local` にコピーして値を設定。
```bash
cp .env.example .env.local
```
開発中は `DEV_FAKE_DELIVERY=true` にすると、SMS/メールを実送信せず
**サーバのコンソールに確認コードが出力される**ため、無料で動作確認できる。

### 4. 管理者アカウント作成
```bash
node scripts/seed-admin.mjs "admin@example.com" "あなたのパスワード" "運営 花子"
```

### 5. 起動
```bash
npm run dev
```
- 高齢者向け: http://localhost:3000/ （未ログインなら登録画面へ）
- 管理者向け: http://localhost:3000/admin/login

## 認証の考え方（重要）

要件の「名前＋電話番号だけ」ではなりすましを防げないため、
名前・電話番号を**識別子**、SMS OTPを**本人証明**として役割分担している。
高齢者の体験は「番号を入れるだけ」を保ちつつ、実機所持を要求してセキュリティを担保する。
詳細は `docs/auth-flow.md` を参照。

## セキュリティ設計の要点

- OTP・セッショントークンは平文保存せず、必ずハッシュ化して保存
- 管理画面はメール＋パスワード＋メール6桁の多要素認証、セッションは約8時間
- DBは Row Level Security でデフォルト拒否。個人情報は service_role 経由の
  サーバ処理のみ到達可能（VPNなしでもアプリ層で経路を遮断）
- login/register は一致有無に関わらず同一レスポンスを返し、名簿照合を防止
- 管理者操作は `admin_audit_log` に記録

## 補足

- SMS OTPは送信ごとに実費（1通数円）が発生する。電話番号・IP単位のレート制限を
  本番前に必ず有効化すること。
- 本リポジトリは要件とワイヤーフレームに基づく実装の土台。決済・地域推定の精緻化・
  相談詳細画面などは今後の拡張ポイント。
