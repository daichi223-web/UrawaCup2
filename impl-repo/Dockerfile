# マルチステージビルド
# Stage 1: Frontendビルド
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 依存関係インストール
COPY src/frontend/package*.json ./
RUN npm ci

# ソースコピーとビルド
COPY src/frontend/ ./
RUN npm run build


# Stage 2: バックエンド
FROM python:3.11-slim

# 環境変数
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENV=production

WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Pythonパッケージインストール
COPY src/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコード
COPY src/backend/ ./

# 静的ファイル（フロントエンドビルド成果物）
COPY --from=frontend-builder /app/frontend/dist /app/static

# データディレクトリ
RUN mkdir -p /app/data /app/logs

# 非rootユーザー
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# ポート
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# 起動コマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
