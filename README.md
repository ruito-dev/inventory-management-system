# 在庫管理システム (Inventory Management System)

企業向けポートフォリオプロジェクトとして作成した、モダンな在庫管理システムです。

## 技術スタック

### フロントエンド

- **Next.js 16** - Reactフレームワーク
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク

### バックエンド・データベース

- **Prisma 5.22.0** - 次世代ORMツール（Alpine Linux環境での安定性のため）
- **PostgreSQL 16** - リレーショナルデータベース
- **NextAuth.js (beta)** - 認証ライブラリ

### UI・フォーム

- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **Lucide React** - アイコンライブラリ
- **Recharts** - データ可視化

### ユーティリティ

- **bcryptjs** - パスワードハッシュ化
- **date-fns** - 日付操作

### 開発ツール

- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマッター
- **Jest** - テストフレームワーク
- **React Testing Library** - Reactコンポーネントテスト
- **husky** - Gitフック管理
- **lint-staged** - ステージングファイルのLint実行

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
npm run lint:fix  # 自動修正

# フォーマット
npm run format         # 全ファイルをフォーマット
npm run format:check   # フォーマットチェックのみ

# テスト
npm test              # テスト実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き
```

### テストの種類

- **コンポーネントテスト**: React Testing Libraryを使用したUIコンポーネントのテスト
- **ユーティリティテスト**: 共通関数のユニットテスト
- **API Routeテスト**: Next.js API Routeのエンドポイントテスト（NextRequestを使用）

テストファイルは対象ファイルと同じディレクトリの`__tests__`フォルダに配置されています。

### コミット前の自動チェック

このプロジェクトでは、huskyとlint-stagedを使用して、コミット前に自動的にLintとフォーマットを実行します。

- コミット時に自動的にステージングされたファイルに対してESLintとPrettierが実行されます
- エラーがある場合はコミットが中断されます
- 自動修正可能なエラーは自動的に修正されます

## トラブルシューティング

### Docker環境でPrismaエラーが発生する場合

Alpine Linuxベースのコンテナで`PrismaClientInitializationError`が発生する場合、OpenSSLライブラリの依存関係が原因の可能性があります。

**解決方法**:

1. `Dockerfile.dev`に以下のパッケージが含まれていることを確認:

   ```dockerfile
   RUN apk add --no-cache libc6-compat openssl openssl-dev
   ```

2. Prismaのバージョンを確認（v5.22.0を推奨）:

   ```json
   "@prisma/client": "^5.22.0",
   "prisma": "^5.22.0"
   ```

3. コンテナを再ビルド:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up --build
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
