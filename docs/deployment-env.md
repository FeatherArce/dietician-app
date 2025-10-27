# 部署環境變數配置指南

## 本地開發環境 (.env)
```
DATABASE_URL_LOCAL="file:./data/dev.db"
```

## Vercel 部署
Vercel 不支援持久化檔案系統，SQLite 檔案會在每次部署後消失。
建議使用 PostgreSQL 或其他雲端資料庫：
```
DATABASE_URL="postgresql://username:password@host:port/database"
# 不要設定 DATABASE_URL_LOCAL，讓應用使用 PostgreSQL
```

## Docker 容器部署
```
DATABASE_URL_LOCAL="file:/app/data/dev.db"
# 記得在 Dockerfile 中創建 /app/data 目錄
# 並使用 volume 掛載來持久化資料
```

## 其他雲端平台 (Railway, Render 等)
```
# 使用臨時目錄（資料不會持久化）
DATABASE_URL_LOCAL="file:/tmp/dev.db"

# 或者配置持久化儲存
DATABASE_URL_LOCAL="file:/var/data/dev.db"
```

## 生產環境建議
建議在生產環境使用 PostgreSQL 而非 SQLite：
1. 更好的併發支援
2. 更強的資料一致性
3. 雲端平台原生支援
4. 備份和復原機制

配置方式：
```
DATABASE_URL="postgresql://..."
# 不設定 DATABASE_URL_LOCAL，應用會自動使用 PostgreSQL
```