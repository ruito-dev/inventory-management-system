# データベース設計書

## 概要

在庫管理システムのデータベース設計書です。PostgreSQLを使用し、Prisma ORMで管理します。

## テーブル一覧

| テーブル名           | 論理名   | 説明                           |
| -------------------- | -------- | ------------------------------ |
| users                | ユーザー | システムを利用するユーザー情報 |
| categories           | カテゴリ | 商品のカテゴリ分類             |
| products             | 商品     | 在庫管理対象の商品情報         |
| stock_transactions   | 在庫取引 | 商品の入出庫履歴               |
| suppliers            | 仕入先   | 商品の仕入先情報               |
| purchase_orders      | 発注     | 仕入先への発注情報             |
| purchase_order_items | 発注明細 | 発注の商品明細                 |

---

## テーブル定義

### users（ユーザー）

システムを利用するユーザーの情報を管理します。

| カラム名  | 型            | NULL | デフォルト | 説明                       |
| --------- | ------------- | ---- | ---------- | -------------------------- |
| id        | String (CUID) | NO   | auto       | ユーザーID（主キー）       |
| email     | String        | NO   | -          | メールアドレス（ユニーク） |
| password  | String        | NO   | -          | ハッシュ化されたパスワード |
| name      | String        | NO   | -          | ユーザー名                 |
| role      | Enum(Role)    | NO   | USER       | ユーザーロール             |
| createdAt | DateTime      | NO   | now()      | 作成日時                   |
| updatedAt | DateTime      | NO   | auto       | 更新日時                   |

**インデックス**

- PRIMARY KEY: id
- UNIQUE: email

**Enum: Role**

- `USER`: 一般ユーザー
- `ADMIN`: 管理者

---

### categories（カテゴリ）

商品を分類するためのカテゴリ情報を管理します。

| カラム名    | 型            | NULL | デフォルト | 説明                   |
| ----------- | ------------- | ---- | ---------- | ---------------------- |
| id          | String (CUID) | NO   | auto       | カテゴリID（主キー）   |
| name        | String        | NO   | -          | カテゴリ名（ユニーク） |
| description | String        | YES  | -          | カテゴリの説明         |
| createdAt   | DateTime      | NO   | now()      | 作成日時               |
| updatedAt   | DateTime      | NO   | auto       | 更新日時               |

**インデックス**

- PRIMARY KEY: id
- UNIQUE: name

---

### products（商品）

在庫管理対象の商品情報を管理します。

| カラム名      | 型            | NULL | デフォルト | 説明                           |
| ------------- | ------------- | ---- | ---------- | ------------------------------ |
| id            | String (CUID) | NO   | auto       | 商品ID（主キー）               |
| name          | String        | NO   | -          | 商品名                         |
| sku           | String        | NO   | -          | 商品コード（ユニーク）         |
| description   | String        | YES  | -          | 商品説明                       |
| categoryId    | String        | NO   | -          | カテゴリID（外部キー）         |
| price         | Decimal(10,2) | NO   | -          | 販売価格                       |
| currentStock  | Int           | NO   | 0          | 現在の在庫数                   |
| minStockLevel | Int           | NO   | 0          | 最小在庫レベル（アラート閾値） |
| createdAt     | DateTime      | NO   | now()      | 作成日時                       |
| updatedAt     | DateTime      | NO   | auto       | 更新日時                       |

**インデックス**

- PRIMARY KEY: id
- UNIQUE: sku
- FOREIGN KEY: categoryId → categories(id) ON DELETE CASCADE

**ビジネスルール**

- `currentStock`が`minStockLevel`以下になった場合、在庫アラートを表示
- カテゴリ削除時は関連商品も削除される（CASCADE）

---

### stock_transactions（在庫取引）

商品の入出庫履歴を記録します。

| カラム名  | 型                         | NULL | デフォルト | 説明                       |
| --------- | -------------------------- | ---- | ---------- | -------------------------- |
| id        | String (CUID)              | NO   | auto       | 取引ID（主キー）           |
| productId | String                     | NO   | -          | 商品ID（外部キー）         |
| type      | Enum(StockTransactionType) | NO   | -          | 取引タイプ                 |
| quantity  | Int                        | NO   | -          | 数量                       |
| reason    | String                     | YES  | -          | 理由・備考                 |
| userId    | String                     | NO   | -          | 実行ユーザーID（外部キー） |
| createdAt | DateTime                   | NO   | now()      | 取引日時                   |

**インデックス**

- PRIMARY KEY: id
- FOREIGN KEY: productId → products(id) ON DELETE CASCADE
- FOREIGN KEY: userId → users(id)

**Enum: StockTransactionType**

- `IN`: 入庫（仕入れ、返品受入、調整増）
- `OUT`: 出庫（販売、返品、調整減）

**ビジネスルール**

- 取引実行時に商品の`currentStock`を自動更新
- 履歴は削除不可（監査証跡として保持）

---

### suppliers（仕入先）

商品の仕入先情報を管理します。

| カラム名  | 型            | NULL | デフォルト | 説明               |
| --------- | ------------- | ---- | ---------- | ------------------ |
| id        | String (CUID) | NO   | auto       | 仕入先ID（主キー） |
| name      | String        | NO   | -          | 仕入先名           |
| email     | String        | YES  | -          | メールアドレス     |
| phone     | String        | YES  | -          | 電話番号           |
| address   | String        | YES  | -          | 住所               |
| createdAt | DateTime      | NO   | now()      | 作成日時           |
| updatedAt | DateTime      | NO   | auto       | 更新日時           |

**インデックス**

- PRIMARY KEY: id

---

### purchase_orders（発注）

仕入先への発注情報を管理します。

| カラム名     | 型                        | NULL | デフォルト | 説明                 |
| ------------ | ------------------------- | ---- | ---------- | -------------------- |
| id           | String (CUID)             | NO   | auto       | 発注ID（主キー）     |
| supplierId   | String                    | NO   | -          | 仕入先ID（外部キー） |
| status       | Enum(PurchaseOrderStatus) | NO   | PENDING    | 発注ステータス       |
| orderDate    | DateTime                  | NO   | now()      | 発注日               |
| expectedDate | DateTime                  | YES  | -          | 納期予定日           |
| totalAmount  | Decimal(10,2)             | NO   | -          | 合計金額             |
| createdAt    | DateTime                  | NO   | now()      | 作成日時             |
| updatedAt    | DateTime                  | NO   | auto       | 更新日時             |

**インデックス**

- PRIMARY KEY: id
- FOREIGN KEY: supplierId → suppliers(id)

**Enum: PurchaseOrderStatus**

- `PENDING`: 発注中
- `RECEIVED`: 入荷済み
- `CANCELLED`: キャンセル

**ビジネスルール**

- ステータスが`RECEIVED`になった時、在庫を自動更新
- `totalAmount`は発注明細の合計から自動計算

---

### purchase_order_items（発注明細）

発注の商品明細を管理します。

| カラム名        | 型            | NULL | デフォルト | 説明               |
| --------------- | ------------- | ---- | ---------- | ------------------ |
| id              | String (CUID) | NO   | auto       | 明細ID（主キー）   |
| purchaseOrderId | String        | NO   | -          | 発注ID（外部キー） |
| productId       | String        | NO   | -          | 商品ID（外部キー） |
| quantity        | Int           | NO   | -          | 発注数量           |
| unitPrice       | Decimal(10,2) | NO   | -          | 単価               |
| createdAt       | DateTime      | NO   | now()      | 作成日時           |
| updatedAt       | DateTime      | NO   | auto       | 更新日時           |

**インデックス**

- PRIMARY KEY: id
- FOREIGN KEY: purchaseOrderId → purchase_orders(id) ON DELETE CASCADE
- FOREIGN KEY: productId → products(id)

**ビジネスルール**

- 発注削除時は明細も削除される（CASCADE）
- 小計 = `quantity` × `unitPrice`

---

## リレーション図

```
users (1) ----< (N) stock_transactions
categories (1) ----< (N) products
products (1) ----< (N) stock_transactions
products (1) ----< (N) purchase_order_items
suppliers (1) ----< (N) purchase_orders
purchase_orders (1) ----< (N) purchase_order_items
```

---

## データ整合性

### 外部キー制約

- `products.categoryId` → `categories.id` (CASCADE)
- `stock_transactions.productId` → `products.id` (CASCADE)
- `stock_transactions.userId` → `users.id`
- `purchase_orders.supplierId` → `suppliers.id`
- `purchase_order_items.purchaseOrderId` → `purchase_orders.id` (CASCADE)
- `purchase_order_items.productId` → `products.id`

### トランザクション管理

以下の操作はトランザクション内で実行する必要があります：

1. **在庫取引の登録**
   - `stock_transactions`レコード作成
   - `products.currentStock`の更新

2. **発注の入荷処理**
   - `purchase_orders.status`を`RECEIVED`に更新
   - 各明細に対して`stock_transactions`レコード作成（type: IN）
   - 各商品の`currentStock`を更新

3. **発注の作成**
   - `purchase_orders`レコード作成
   - `purchase_order_items`レコード作成
   - `totalAmount`の計算と更新

---

## セキュリティ考慮事項

1. **パスワード管理**
   - `users.password`はbcryptjsでハッシュ化して保存
   - 最低8文字以上を推奨

2. **アクセス制御**
   - `ADMIN`ロールのみが実行可能な操作
     - ユーザー管理
     - カテゴリ・仕入先の削除
   - `USER`ロールでも実行可能な操作
     - 商品・在庫の閲覧
     - 在庫取引の登録
     - 発注の作成

3. **監査ログ**
   - 全テーブルに`createdAt`を記録
   - 更新可能なテーブルには`updatedAt`を記録
   - `stock_transactions`は削除不可（監査証跡）

---

## パフォーマンス最適化

### 推奨インデックス

```sql
-- 商品検索の高速化
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_stock ON products(currentStock);

-- 在庫取引履歴の検索
CREATE INDEX idx_stock_transactions_product ON stock_transactions(productId);
CREATE INDEX idx_stock_transactions_created ON stock_transactions(createdAt);

-- 発注検索
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplierId);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
```

### クエリ最適化

- 商品一覧取得時は`category`をeager loading
- 在庫取引履歴取得時は`product`と`user`をeager loading
- 発注詳細取得時は`supplier`と`items.product`をeager loading

---

## バックアップ戦略

1. **日次バックアップ**
   - 全テーブルのフルバックアップ
   - 保持期間: 30日

2. **トランザクションログ**
   - 継続的にアーカイブ
   - ポイントインタイムリカバリ対応

3. **重要データの優先度**
   - 最優先: `stock_transactions`（監査証跡）
   - 高優先: `products`, `purchase_orders`
   - 中優先: `users`, `categories`, `suppliers`
