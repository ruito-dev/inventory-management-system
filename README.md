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

### 方法1: Docker を使用（推奨）

Dockerを使用すると、環境構築が簡単で一貫性のある開発環境を構築できます。

#### 前提条件

- Docker 20.10以上
- Docker Compose 2.0以上

#### 開発環境の起動

```bash
# リポジトリのクローン
git clone https://github.com/ruito-dev/inventory-management-system.git
cd inventory-management-system

# 環境変数の設定
cp .env.example .env

# Docker Composeで起動（初回はビルドに時間がかかります）
docker-compose -f docker-compose.dev.yml up --build

# バックグラウンドで起動する場合
docker-compose -f docker-compose.dev.yml up -d --build
```

アプリケーションは http://localhost:3000 で起動します。

詳細は [Dockerドキュメント](docs/docker.md) を参照してください。

### 方法2: ローカル環境

#### 前提条件

- Node.js 20以上
- npm または yarn
- PostgreSQL 16以上

#### インストール

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

## ドキュメント

- [データベース設計書](docs/database-design.md) - テーブル定義、リレーション、ビジネスルール
- [ER図](docs/er-diagram.md) - エンティティ関係図とデータフロー
- [Docker環境セットアップガイド](docs/docker.md) - Docker/Docker Composeの使用方法

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
