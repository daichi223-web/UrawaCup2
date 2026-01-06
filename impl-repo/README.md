# 浦和カップ トーナメント管理システム

さいたま市招待高校サッカーフェスティバル（浦和カップ）の運営を支援するWebアプリケーションです。

## 機能概要

### 試合管理
- 試合スケジュール作成・編集
- リアルタイムスコア入力
- 得点者・アシスト記録
- PK戦対応

### 順位表
- 5段階タイブレーク自動計算
  1. 勝ち点
  2. 得失点差
  3. 総得点
  4. 直接対決
  5. 抽選（SHA256ハッシュによる決定論的抽選）

### 最終日トーナメント
- 予選順位に基づく自動組み合わせ
- 2/4/8グループ対応
- 研修試合自動生成

### 帳票出力
- 組み合わせ表PDF
- 日程別試合表PDF
- 最終結果PDF

### 公開画面
- 認証不要の一般公開用ページ
- リアルタイム順位表・試合結果

### PWA対応
- オフライン閲覧
- ホーム画面追加
- バックグラウンド同期

## 技術スタック

### バックエンド
- Python 3.11+
- FastAPI
- SQLAlchemy + SQLite
- ReportLab（PDF生成）
- JWT認証

### フロントエンド
- React 18 + TypeScript
- Vite
- TailwindCSS
- TanStack Query
- Dexie.js（IndexedDB）

## セットアップ

### 開発環境

```bash
# リポジトリクローン
git clone <repository-url>
cd urawacup

# バックエンド
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# フロントエンド（別ターミナル）
cd src/frontend
npm install
npm run dev
```

### Docker環境

```bash
# 開発環境
docker-compose up -d

# 本番環境（Nginx付き）
docker-compose --profile production up -d
```

### 環境変数

`.env.example` を `.env` にコピーして編集：

```bash
cp .env.example .env
```

重要な設定：
- `SECRET_KEY`: JWT署名用シークレット（本番では必ず変更）
- `ALLOWED_ORIGINS`: CORS許可オリジン
- `DATABASE_URL`: データベース接続URL

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報

### 大会
- `GET /api/tournaments` - 大会一覧
- `POST /api/tournaments` - 大会作成
- `GET /api/tournaments/{id}` - 大会詳細

### チーム
- `GET /api/teams` - チーム一覧
- `POST /api/teams` - チーム登録
- `POST /api/teams/import` - CSVインポート

### 試合
- `GET /api/matches` - 試合一覧
- `POST /api/matches` - 試合作成
- `PUT /api/matches/{id}` - 試合更新
- `POST /api/matches/{id}/lock` - 悲観的ロック
- `POST /api/matches/{id}/unlock` - ロック解除

### 順位表
- `GET /api/standings/{tournament_id}` - 順位表取得
- `POST /api/standings/{tournament_id}/recalculate` - 再計算

### 最終日
- `GET /api/final-day/config/{tournament_id}` - 設定取得
- `POST /api/final-day/generate` - トーナメント生成

### 公開API（認証不要）
- `GET /api/public/tournaments` - 大会一覧
- `GET /api/public/tournaments/{id}/standings` - 順位表
- `GET /api/public/tournaments/{id}/matches` - 試合結果
- `GET /api/public/tournaments/{id}/scorers` - 得点ランキング

## ユーザーロール

| ロール | 権限 |
|--------|------|
| admin | 全機能アクセス |
| manager | 試合・チーム管理、帳票出力 |
| scorer | スコア入力のみ |
| viewer | 閲覧のみ |

## テスト

```bash
# バックエンドテスト
cd src/backend
pytest tests/ -v

# フロントエンドテスト
cd src/frontend
npm test
```

## デプロイ

### 本番環境チェックリスト

1. `SECRET_KEY` を安全な値に変更
2. `ALLOWED_ORIGINS` を本番ドメインに設定
3. SSL証明書の設置
4. データベースバックアップ設定
5. ログローテーション設定

### SSL証明書（Let's Encrypt）

```bash
# Certbot導入
apt install certbot

# 証明書取得
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# ssl/ディレクトリにコピー
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

## ライセンス

MIT License

## 作者

浦和カップ運営事務局
