# 在庫管理システム (Inventory Management System)

企業向けポートフォリオプロジェクトとして作成した、モダンな在庫管理システムです。

## 技術スタック

### フロントエンド
- **Next.js 16** - Reactフレームワーク
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク

### バックエンド・データベース
- **Prisma** - 次世代ORMツール
- **NextAuth.js (beta)** - 認証ライブラリ

### UI・フォーム
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **Lucide React** - アイコンライブラリ
- **Recharts** - データ可視化

### ユーティリティ
- **bcryptjs** - パスワードハッシュ化
- **date-fns** - 日付操作

## 機能

- ユーザー認証・認可
- 在庫の登録・編集・削除
- 在庫の検索・フィルタリング
- 在庫レベルの可視化
- レスポンシブデザイン

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/ruito-dev/inventory-management-system.git
cd inventory-management-system

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集して必要な環境変数を設定

# Prismaのセットアップ
npx prisma generate
npx prisma db push

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 開発

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番環境での起動
npm start

# リント
npm run lint
```

## プロジェクト構成

```
inventory-management-system/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── public/                # 静的ファイル
├── prisma/                # Prismaスキーマ
├── package.json           # 依存関係
└── README.md             # このファイル
```
