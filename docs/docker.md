# Docker環境セットアップガイド

## 概要

このプロジェクトはDockerとDocker Composeを使用して、開発環境と本番環境を簡単にセットアップできます。

## 前提条件

- Docker 20.10以上
- Docker Compose 2.0以上

## ファイル構成

```
.
├── Dockerfile              # 本番環境用Dockerfile
├── Dockerfile.dev          # 開発環境用Dockerfile
├── docker-compose.yml      # 本番環境用Docker Compose設定
├── docker-compose.dev.yml  # 開発環境用Docker Compose設定
└── .dockerignore          # Dockerビルド時の除外ファイル
```

## 開発環境のセットアップ

### 1. 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env

# .envファイルを編集（必要に応じて）
# デフォルト値で動作しますが、NEXTAUTH_SECRETは変更推奨
```

### 2. Docker Composeで起動

```bash
# コンテナのビルドと起動
docker-compose -f docker-compose.dev.yml up --build

# バックグラウンドで起動する場合
docker-compose -f docker-compose.dev.yml up -d --build
```

### 3. データベースのマイグレーション

初回起動時、またはスキーマ変更時に実行：

```bash
# コンテナ内でマイグレーションを実行
docker-compose -f docker-compose.dev.yml exec app npx prisma db push

# または、Prisma Studioを起動してデータを確認
docker-compose -f docker-compose.dev.yml exec app npx prisma studio
```

### 4. アプリケーションへのアクセス

- **アプリケーション**: http://localhost:3000
- **データベース**: localhost:5432

### 5. 停止と削除

```bash
# コンテナの停止
docker-compose -f docker-compose.dev.yml down

# コンテナとボリュームの削除（データも削除される）
docker-compose -f docker-compose.dev.yml down -v
```

## 本番環境のセットアップ

### 1. 環境変数の設定

```bash
# 本番環境用の.envファイルを作成
cp .env.example .env.production

# 以下の環境変数を必ず変更してください
# - NEXTAUTH_SECRET: ランダムな文字列に変更
# - POSTGRES_PASSWORD: 強固なパスワードに変更
# - DATABASE_URL: 本番環境のデータベースURLに変更
```

### 2. Docker Composeで起動

```bash
# 本番環境用のコンテナをビルドと起動
docker-compose up --build -d

# ログの確認
docker-compose logs -f
```

### 3. データベースのマイグレーション

```bash
# マイグレーションの実行
docker-compose exec app npx prisma migrate deploy
```

### 4. ヘルスチェック

```bash
# コンテナの状態確認
docker-compose ps

# アプリケーションのヘルスチェック
curl http://localhost:3000
```

## 開発環境の特徴

### ホットリロード対応

開発環境では、ローカルのファイル変更が自動的にコンテナ内に反映されます。

```yaml
volumes:
  - .:/app              # ソースコードをマウント
  - /app/node_modules   # node_modulesは除外
  - /app/.next          # .nextディレクトリは除外
```

### デバッグ

コンテナ内でシェルを起動してデバッグ：

```bash
# アプリケーションコンテナに入る
docker-compose -f docker-compose.dev.yml exec app sh

# データベースコンテナに入る
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d inventory_management
```

## 本番環境の特徴

### マルチステージビルド

Dockerfileはマルチステージビルドを使用して、イメージサイズを最小化：

1. **deps**: 依存関係のインストール
2. **builder**: アプリケーションのビルド
3. **runner**: 本番環境での実行

### セキュリティ

- 非rootユーザー（nextjs）で実行
- 必要最小限のファイルのみをコピー
- Alpine Linuxベースで軽量化

### イメージサイズの最適化

```bash
# イメージサイズの確認
docker images | grep inventory

# 不要なイメージの削除
docker image prune -a
```

## トラブルシューティング

### ポートが既に使用されている

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# または、.envファイルでポートを変更
APP_PORT=3001
```

### データベース接続エラー

```bash
# データベースコンテナのログを確認
docker-compose logs db

# データベースのヘルスチェック
docker-compose exec db pg_isready -U postgres
```

### ボリュームの問題

```bash
# すべてのボリュームを削除して再作成
docker-compose down -v
docker-compose up --build
```

### キャッシュのクリア

```bash
# Dockerビルドキャッシュをクリア
docker builder prune

# すべてのキャッシュをクリア（注意: 時間がかかる）
docker system prune -a
```

## よく使うコマンド

### ログの確認

```bash
# すべてのコンテナのログ
docker-compose logs -f

# 特定のコンテナのログ
docker-compose logs -f app
docker-compose logs -f db
```

### コンテナの再起動

```bash
# すべてのコンテナを再起動
docker-compose restart

# 特定のコンテナを再起動
docker-compose restart app
```

### データベースのバックアップ

```bash
# データベースをダンプ
docker-compose exec db pg_dump -U postgres inventory_management > backup.sql

# バックアップからリストア
docker-compose exec -T db psql -U postgres inventory_management < backup.sql
```

### Prismaコマンド

```bash
# Prisma Clientの再生成
docker-compose exec app npx prisma generate

# データベーススキーマの同期
docker-compose exec app npx prisma db push

# Prisma Studioの起動
docker-compose exec app npx prisma studio
```

## パフォーマンス最適化

### ビルド時間の短縮

```bash
# BuildKitを有効化（Docker 18.09以降）
export DOCKER_BUILDKIT=1
docker-compose build
```

### ボリュームのパフォーマンス（Mac/Windows）

Mac/Windowsでは、ボリュームマウントのパフォーマンスが遅い場合があります：

```yaml
volumes:
  - .:/app:cached  # 読み取りキャッシュを有効化
```

## CI/CDでの使用

### GitHub Actions例

```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t inventory-app .
      
      - name: Run tests
        run: docker-compose run app npm test
```

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env`ファイルは絶対にコミットしない
   - 本番環境では強固なパスワードを使用

2. **イメージの更新**
   - 定期的にベースイメージを更新
   - セキュリティパッチを適用

3. **ネットワークの分離**
   - 必要なポートのみを公開
   - 内部ネットワークを使用

4. **ログの管理**
   - 機密情報をログに出力しない
   - ログローテーションを設定

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
- [Next.js Dockerデプロイガイド](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker ガイド](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
