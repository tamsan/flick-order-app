# 居酒屋注文システム - 手書きチビ伝デジタル化プロジェクト

## 🎯 プロジェクト背景

### ビジネス課題
20店舗展開の高級居酒屋オーナー社長からの課題解決要請：
- **現状の問題**: 手書き紙チビ伝 → レジへの二重入力作業
- **市場規模**: 日本の飲食店の4割が手書きチビ伝を使用
- **顧客要望**: お客様とのコミュニケーションを重視した注文体験
- **技術的課題**: 既存POSシステムでは顧客コミュニケーションが困難

### プロジェクト目標
**手書き紙チビ伝に変わるスマホ注文システムの実現**
- 2-3日間の現場ユーザビリティテスト専用システム
- 現場サービスマン10-20名による実使用テスト
- 手書き紙チビ伝からの移行効果測定

## 🏗️ システム設計

### アーキテクチャ
```
[スマホブラウザ] ←→ [Heroku WebApp] ←→ [Supabase DB]
```

### 技術スタック
- **フロントエンド**: HTML5/CSS3/JavaScript (PWA対応)
- **バックエンド**: Node.js/Express (25行の超軽量サーバー)
- **データベース**: Supabase PostgreSQL (テーブル1つのみ)
- **デプロイ**: Heroku (自動デプロイ)
- **ソース管理**: GitHub

## 📱 UI/UX設計

### 32行チビ伝システム
- **表示**: 8行がファーストビュー、スクロールで32行まで
- **操作**: iPhone15最適化、指タップに最適な行間設計
- **注文フロー**: 入力 → 注文 → グレー化 → 変更/取消可能

### 主要機能
- ✅ テーブル選択 (1-8テーブル)
- ✅ メニュー入力 (ひらがな検索対応オートコンプリート)
- ✅ 注文確定 (32行まで一括処理)
- ✅ 注文履歴 (確定後はグレー表示)
- ✅ 個別商品変更 (数量のみ変更可能)
- ✅ 個別商品取消 (取消線表示)
- ✅ 追加注文 (グレー行の下で新規入力)
- ✅ 会計連携準備 (Square API連携予定)

### デザインコンセプト
- **色彩**: 茶系統一 (#8B4513) - 居酒屋らしい温かみ
- **レイアウト**: 手書きチビ伝の操作感を維持
- **操作性**: 片手操作対応、誤タップ防止

## 🗄️ データベース設計

### 超シンプル構成 (テーブル1つのみ)

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_number INTEGER,
    order_rows JSONB,  -- 全32行のデータをJSONで保存
    created_at TIMESTAMP DEFAULT NOW()
);
```

### メニューデータ
- **保存場所**: JavaScript配列 (DB不使用)
- **データ**: 30品目の居酒屋メニュー
- **検索**: ひらがな対応 (例: "びーる" → "ビールアサヒ")

```javascript
const menuData = [
    { name: "ビールアサヒ", price: 600, kana: "びーるあさひ" },
    { name: "生ビール", price: 500, kana: "なまびーる" },
    // ... 30品目
];
```

## 🔌 API設計

### 最小限のAPI (2つのみ)

#### 1. POST /api/orders - 注文保存
```javascript
// リクエスト
{
    "table_number": 3,
    "order_rows": [
        {"name": "生ビール", "quantity": 2, "price": 500, "status": "active"},
        // ... 32行分
    ]
}

// レスポンス
{"success": true, "data": {...}}
```

#### 2. GET /api/orders - 注文取得
```javascript
// レスポンス
[
    {
        "id": 1,
        "table_number": 3,
        "order_rows": [...],
        "created_at": "2025-06-30T12:00:00Z"
    }
]
```

## 📁 ファイル構成

```
izakaya-order-system/
├── README.md           # このファイル
├── index.html          # メインUIファイル (完成済み)
├── server.js           # Node.jsサーバー (25行、作成予定)
├── package.json        # 依存関係 (作成予定)
├── .env               # 環境変数 (Supabase接続情報)
├── .gitignore         # Git除外設定
└── docs/              # ドキュメント
    ├── setup.md       # セットアップ手順
    └── api.md         # API仕様書
```

## 🚀 実装ロードマップ

### Phase 1: 環境構築 (15分)
- [ ] Supabaseアカウント作成
- [ ] プロジェクト作成
- [ ] ordersテーブル作成
- [ ] API キー取得

### Phase 2: サーバー開発 (45分)
- [ ] server.js 作成 (25行)
- [ ] package.json 作成
- [ ] ローカル動作確認
- [ ] API テスト

### Phase 3: デプロイ (30分)
- [ ] Herokuアカウント作成
- [ ] GitHubリポジトリ接続
- [ ] 環境変数設定
- [ ] 本番デプロイ

**合計実装時間: 1.5時間**

## 💻 コード例

### server.js (完全版)
```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

app.use(express.static('.'));
app.use(express.json());

// 注文保存
app.post('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert(req.body);
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 注文取得
app.get('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### package.json
```json
{
  "name": "izakaya-order-system",
  "version": "1.0.0",
  "description": "デジタルチビ伝システム",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.38.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### HTML修正 (API連携)
```javascript
// 既存のlocalStorage部分を置き換え
// 注文確定時
async function saveOrderToServer(orderData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table_number: orderData.tableNumber,
                order_rows: orderData.orderRows
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('注文保存成功');
        }
    } catch (error) {
        console.error('注文保存エラー:', error);
    }
}
```

## 🎛️ 環境設定

### .env ファイル
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Heroku 環境変数
```bash
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=your-anon-key
```

## 📊 成功基準

### 技術指標
- [ ] 10台のスマホで同時利用可能
- [ ] 注文データが各端末で共有される
- [ ] 32行チビ伝が正常動作
- [ ] レスポンス時間 < 2秒
- [ ] 2-3日間安定稼働

### ビジネス指標
- [ ] 手書きチビ伝からの移行時間 < 30秒
- [ ] 注文入力時間 < 従来の50%
- [ ] エラー率 < 1%
- [ ] ユーザー満足度 > 4.0/5.0

## 🚫 意図的に削除した機能

### 複雑性排除
- ❌ 認証・認可システム
- ❌ 店舗別管理
- ❌ スタッフ管理
- ❌ リアルタイム同期 (複雑すぎるため)
- ❌ 詳細ログ・監視機能
- ❌ セキュリティ対策 (テスト用途のため)

### テスト後削除予定
- ❌ 全注文データ (手動削除)
- ❌ Supabaseプロジェクト (不要になったら削除)

## 🛠️ 開発サポート体制

### Claude (AI)が担当
- ✅ 全コード作成
- ✅ 詳細手順書作成
- ✅ リアルタイムサポート
- ✅ 問題解決・デバッグ

### 人間側の作業
- ✅ アカウント作成 (Supabase, Heroku, GitHub)
- ✅ コピペ作業
- ✅ 動作確認
- ✅ ユーザビリティテスト実施

## 📞 次のチャットでの継続方法

### 引き継ぎ情報
1. **現状**: UIは完成済み (index.html)
2. **次のステップ**: Supabase設定 → サーバー作成 → デプロイ
3. **所要時間**: 1.5時間で完了予定
4. **サポート**: 段階的に一緒に進める

### 継続時の最初の言葉
```
「居酒屋注文システムの開発を継続したいです。
手書きチビ伝のデジタル化プロジェクトで、
UIは完成済みです。次はSupabaseの設定から
始めたいと思います。READMEを確認してもらえますか？」
```

## 🎉 期待される成果

### 短期的成果 (2-3日のテスト)
- 手書きチビ伝からの移行効果測定
- 現場スタッフからの実用性フィードバック
- システムの安定性・操作性検証

### 長期的ビジョン
- 20店舗への本格導入
- POSシステム連携
- Square決済システム連携
- 売上分析・レポート機能

---

**このプロジェクトは、伝統的な居酒屋の接客文化を大切にしながら、デジタル技術で業務効率を向上させる挑戦です。**
