# 資料庫託管方案評估報告

## 專案背景
- **專案名稱**: 營養師 ERP 系統 (Dietician ERP)
- **前端部署**: Vercel (Next.js)
- **資料庫需求**: PostgreSQL
- **現有資源**: 運行 Discord Bot 的 VPS

## 架構決策
將資料庫從前端分離，部署到獨立的 VPS 上，前端應用通過網路連接到資料庫。

```
┌─────────────────┐    HTTPS     ┌─────────────────┐
│   Vercel        │ ───────────► │   VPS Server    │
│   (Next.js App) │              │   (PostgreSQL)  │
│                 │              │   (Discord Bot) │
└─────────────────┘              └─────────────────┘
```

---

## 資料庫託管方案比較

**實際可選方案說明**: 
- Vercel 本身不提供資料庫服務，只是透過 Marketplace 整合第三方服務
- 以下比較的是實際的資料庫提供商，而非 Vercel 的服務

### 1. 🟢 Neon PostgreSQL

#### ✅ 優點
- **PostgreSQL 原生**: 完整的 PostgreSQL 功能支援
- **Serverless 架構**: 自動休眠節省成本，按需求計費
- **分支功能**: 可為每個 Git 分支建立資料庫分支，適合開發流程
- **免費額度慷慨**: 0.5GB 儲存 + 100小時計算時間/月
- **冷啟動快速**: < 1秒啟動時間
- **內建備份**: 自動時間點恢復 (Point-in-time Recovery)
- **全球邊緣網路**: 低延遲連接

#### ❌ 缺點
- **相對較新**: 生態系統還在成長中
- **計算時間限制**: 免費版每月100小時限制
- **地理位置限制**: 主要數據中心在美國，亞洲用戶可能有延遲
- **供應商依賴**: 綁定 Neon 平台

#### 💰 定價結構
```
🆓 免費版: 0.5GB 儲存 + 100小時計算時間/月
💳 Launch版: $19/月 (10GB + 300小時)
💳 Scale版: $69/月 (無限制)
```

---

### 2. 🟦 Supabase

#### ✅ 優點
- **全棧 BaaS**: 不只資料庫，還包含認證、儲存、即時訂閱等功能
- **PostgreSQL + 擴展**: 支援 RLS、即時功能、REST API 自動生成
- **開源項目**: 可自託管，避免供應商鎖定
- **完整 Dashboard**: 內建 SQL 編輯器、表格編輯器、API 瀏覽器
- **最佳免費額度**: 500MB 儲存 + 無限查詢次數
- **即時功能**: WebSocket 支援，適合即時應用
- **豐富生態系統**: 大量第三方整合

#### ❌ 缺點
- **功能過於複雜**: 如果只需要資料庫，可能造成過度設計
- **依賴性高**: 深度綁定 Supabase 生態系統
- **學習曲線**: 需要了解 RLS (Row Level Security) 等進階功能
- **資源消耗**: 全棧功能可能消耗更多資源

#### 💰 定價結構
```
🆓 免費版: 500MB 儲存 + 無限查詢 + 50,000 月活用戶
💳 Pro版: $25/月 (8GB + 100,000 月活用戶)
💳 Team版: $599/月 (更高限制 + 團隊功能)
```

---

### 3. 🔷 Vercel Marketplace 整合方案

**重要說明**: Vercel 本身並不提供 PostgreSQL 服務，而是透過 Vercel Marketplace 整合第三方資料庫提供商。

#### 🤝 **Vercel 官方推薦的資料庫夥伴**
- **Neon**: Serverless PostgreSQL（主要推薦）
- **PlanetScale**: Serverless MySQL
- **Upstash**: Redis 和 Vector 資料庫
- **Xata**: TypeScript 原生資料庫
- **Railway**: 全棧平台含 PostgreSQL

#### ✅ 優點
- **一鍵整合**: 透過 Vercel Dashboard 快速設置
- **環境變數自動設置**: 自動配置連接字串到 Vercel 專案
- **統一帳單**: 某些合作夥伴支援統一計費
- **文檔完整**: Vercel 提供詳細的整合文檔
- **最佳實踐**: 預設配置符合 Vercel 最佳實踐

#### ❌ 缺點
- **非官方服務**: 實際上是第三方服務的集成
- **供應商依賴**: 仍然依賴第三方資料庫提供商
- **間接支援**: 技術支援需要透過原服務提供商
- **定價透明度**: 可能存在 Vercel 整合費用
- **選擇限制**: 只能選擇 Vercel 合作的提供商

#### 💰 實際成本
```
實際成本 = 第三方服務費用 + 可能的 Vercel 整合費用
主要推薦: Neon（透過 Vercel Marketplace）
- 免費額度與直接使用 Neon 相同
- 整合便利性 vs 直接管理的取捨
```

#### � **建議策略**
**直接使用 Neon 或 Supabase**，而不是透過 Vercel Marketplace：
- 更直接的技術支援
- 完整的功能存取權
- 避免可能的額外費用
- 更好的供應商關係管理

---

### 4. 🐳 自託管 VPS + Docker (推薦方案)

#### ✅ 優點
- **完全控制權**: 所有配置、版本、優化都可自訂
- **成本透明**: 只需支付 VPS 費用，無隱藏成本
- **無供應商鎖定**: 可隨時遷移到其他平台
- **效能可調**: CPU/記憶體可根據實際需求調整
- **多服務支援**: 可同時運行多個資料庫和服務
- **學習價值**: 提升 DevOps 和系統管理技能
- **資源共享**: 與現有 Discord Bot 共享伺服器資源
- **數據主權**: 完全控制數據位置和安全性

#### ❌ 缺點
- **維護責任**: 備份、安全性、更新都需要自己處理
- **技術門檻高**: 需要 Docker、Linux、網路、資安知識
- **無自動擴展**: 需要手動監控和擴展資源
- **單點故障風險**: 沒有內建高可用性機制
- **時間投資**: 初始設置和日常維護需要時間
- **緊急響應**: 故障時需要自己處理

#### 💰 成本估算
```
💻 VPS 成本: $0 (已有伺服器)
⚡ 額外資源: 可能需要升級 RAM/CPU
🔒 SSL 憑證: $0 (Let's Encrypt)
📊 監控工具: $0-10/月
💾 備份儲存: $2-5/月 (雲端備份)
🌐 域名: $1/月 (如需要)
📈 總計: $3-16/月
```

---

## VPS 資源需求與共存分析

### 當前環境評估
- **現有服務**: Discord Bot
- **新增服務**: PostgreSQL 資料庫
- **部署方式**: Docker Compose

### 資源需求分析

#### Discord Bot 典型需求
```
CPU: 0.1-0.5 vCPU (待機時)
RAM: 100-500MB
網路: 低到中等 (WebSocket 連接)
磁碟: 最小 (主要是日誌)
```

#### PostgreSQL 基礎需求
```
CPU: 0.5-1 vCPU (小型應用)
RAM: 512MB-2GB (依資料量而定)
磁碟 I/O: 中等 (讀寫操作)
網路: 低到中等 (外部連接)
```

#### 建議伺服器配置
```
最低需求: 2GB RAM + 1 vCPU
推薦配置: 4GB RAM + 2 vCPU
理想配置: 8GB RAM + 2-4 vCPU
```

### 資源共享策略

#### Docker 資源限制
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.25'
  
  discord-bot:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

#### 網路隔離
```yaml
networks:
  bot_network:     # Discord Bot 專用
  db_network:      # 資料庫專用  
  external:        # 外部訪問
```

### 潛在風險與緩解措施

#### 🚨 記憶體競爭
**風險**: 兩個服務同時消耗大量記憶體
**緩解**: 
- 設置 Docker 記憶體限制
- 實施 OOM 監控和自動重啟
- 預留 20% 系統記憶體緩衝

#### 🚨 磁碟 I/O 競爭  
**風險**: PostgreSQL 寫入與 Bot 日誌競爭
**緩解**:
- 使用 SSD 硬碟
- 分離數據和日誌路徑
- 實施日誌輪替政策

#### 🚨 網路埠衝突
**風險**: 服務使用相同埠號
**緩解**:
- 明確定義埠對應
- 使用 Docker 網路隔離
- 實施防火牆規則

---

## 安全性考量

### 網路安全
```bash
# 防火牆配置
sudo ufw allow ssh                    # SSH 訪問
sudo ufw allow from ANY to any port 5432  # PostgreSQL (限制來源 IP)
sudo ufw deny 5432                   # 拒絕其他 PostgreSQL 訪問
```

### 資料庫安全
```sql
-- 建立專用應用使用者
CREATE USER dietician_app WITH PASSWORD 'strong_random_password';
CREATE DATABASE dietician_erp OWNER dietician_app;

-- 限制權限
REVOKE ALL ON DATABASE dietician_erp FROM PUBLIC;
GRANT CONNECT ON DATABASE dietician_erp TO dietician_app;
```

### Docker 安全
- 使用非 root 使用者運行容器
- 定期更新 Docker 映像
- 實施容器掃描
- 限制容器權限

---

## 備份與災難恢復

### 自動備份策略
```bash
# 每日備份腳本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U dietician_app dietician_erp > backup_$DATE.sql
gzip backup_$DATE.sql

# 上傳到雲端儲存
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
```

### 保留政策
- **每日備份**: 保留 30 天
- **每週備份**: 保留 12 週  
- **每月備份**: 保留 12 個月
- **年度備份**: 永久保留

### 災難恢復程序
1. **資料恢復**: 從最新備份恢復資料庫
2. **服務重啟**: 重新部署 Docker 容器
3. **連接測試**: 驗證應用程式連接
4. **數據驗證**: 確認數據完整性

---

## 監控與維護

### 性能監控指標
- **CPU 使用率**: < 70%
- **記憶體使用率**: < 80%  
- **磁碟使用率**: < 85%
- **資料庫連接數**: < 50
- **查詢回應時間**: < 100ms

### 自動化監控腳本
```bash
#!/bin/bash
# health_check.sh

# 檢查 PostgreSQL 狀態
if ! docker exec postgres pg_isready; then
    echo "PostgreSQL 離線!" | mail -s "DB 警報" admin@example.com
    docker restart postgres
fi

# 檢查磁碟空間
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "磁碟使用率: $DISK_USAGE%" | mail -s "磁碟警報" admin@example.com
fi
```

### 維護時程表
- **每日**: 自動備份、健康檢查
- **每週**: 日誌清理、效能報告
- **每月**: 安全更新、容量規劃
- **每季**: 災難恢復演練

---

## Supabase 方案實施指南

如果選擇使用 Supabase 作為資料庫解決方案，以下是完整的實施步驟：

### 🚀 **Step 1: Supabase 專案設置**

#### 1.1 建立 Supabase 帳號和專案
```bash
# 1. 前往 https://supabase.com 註冊帳號
# 2. 建立新專案
#    - 專案名稱: dietician-erp
#    - 組織: 選擇個人或公司
#    - 資料庫密碼: 使用強密碼
#    - 區域: 選擇最接近的區域 (建議: Southeast Asia - Singapore)
```

#### 1.2 獲取連接資訊
```
專案設置完成後，記錄以下資訊：
- Project URL: https://your-project-id.supabase.co
- API Key (anon public): eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
- API Key (service_role): eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
- Database URL: postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
```

### 🔧 **Step 2: 專案配置**

#### 2.1 安裝 Supabase 客戶端
```bash
# 安裝 Supabase JavaScript 客戶端
npm install @supabase/supabase-js

# 安裝 Supabase CLI (選用，用於本地開發)
npm install -g supabase
```

#### 2.2 環境變數設置
```bash
# .env.local (用於本地開發)
# SQLite 本地開發
DATABASE_URL="file:./data/dev.db"
DATABASE_PROVIDER="sqlite"

# Supabase 生產環境 (部署時使用)
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
DATABASE_URL_PRODUCTION="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"

# 環境標識
NODE_ENV="development"  # 或 "production"
```

#### 2.3 Vercel 環境變數設置
```bash
# 在 Vercel Dashboard 中設置生產環境變數
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
DATABASE_PROVIDER=postgresql
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 🗄️ **Step 3: 資料庫架構設置**

#### 3.1 建立 PostgreSQL Schema
```typescript
// prisma/postgres/schema.prisma (複製現有的 schema)
generator client {
  provider = "prisma-client-js"
  output   = "../../prisma-generated/postgres-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 複製所有現有的 model 定義...
```

#### 3.2 更新 Prisma 配置
```javascript
// prisma/schema-selector.js
const getSchemaPath = () => {
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_PROVIDER === 'postgresql') {
    return './prisma/postgres/schema.prisma';
  }
  return './prisma/sqlite/schema.prisma';
};

module.exports = { getSchemaPath };
```

#### 3.3 建立環境特定的 Prisma 客戶端
```typescript
// services/prisma-supabase.ts
import { PrismaClient } from '@/prisma-generated/postgres-client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

#### 3.4 建立統一的資料庫服務
```typescript
// services/prisma.ts - 統一入口
import { PrismaClient as SQLiteClient } from '@/prisma-generated/sqlite-client';
import { PrismaClient as PostgreSQLClient } from '@/prisma-generated/postgres-client';

const isDevelopment = process.env.NODE_ENV === 'development';
const usePostgreSQL = process.env.DATABASE_PROVIDER === 'postgresql' || 
                      process.env.NODE_ENV === 'production';

let prisma: SQLiteClient | PostgreSQLClient;

if (usePostgreSQL) {
  // 生產環境使用 PostgreSQL (Supabase)
  const globalForPrisma = globalThis as unknown as {
    prisma: PostgreSQLClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PostgreSQLClient({
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

  if (isDevelopment) globalForPrisma.prisma = prisma as PostgreSQLClient;
} else {
  // 開發環境使用 SQLite
  const globalForPrisma = globalThis as unknown as {
    prismaLocal: SQLiteClient | undefined;
  };

  prisma = globalForPrisma.prismaLocal ?? new SQLiteClient({
    log: ['query', 'error', 'warn'],
  });

  if (isDevelopment) globalForPrisma.prismaLocal = prisma as SQLiteClient;
}

export default prisma;
```

### 🔄 **Step 4: 資料庫遷移**

#### 4.1 初始 Schema 推送
```bash
# 1. 設置生產環境變數
export DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"

# 2. 生成 PostgreSQL 客戶端
npx prisma generate --schema=./prisma/postgres/schema.prisma

# 3. 推送 schema 到 Supabase
npx prisma db push --schema=./prisma/postgres/schema.prisma

# 4. 驗證 schema
npx prisma studio --schema=./prisma/postgres/schema.prisma
```

#### 4.2 資料遷移腳本
```typescript
// scripts/migrate-to-supabase.ts
import { PrismaClient as SQLiteClient } from '../prisma-generated/sqlite-client';
import { PrismaClient as PostgreSQLClient } from '../prisma-generated/postgres-client';

const sqliteClient = new SQLiteClient();
const postgresClient = new PostgreSQLClient();

async function migrateData() {
  console.log('🚀 開始資料遷移...');

  try {
    // 1. 遷移使用者資料
    console.log('📊 遷移使用者資料...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log(`✅ 遷移了 ${users.length} 個使用者`);

    // 2. 遷移商店資料
    console.log('🏪 遷移商店資料...');
    const shops = await sqliteClient.shop.findMany();
    for (const shop of shops) {
      await postgresClient.shop.upsert({
        where: { id: shop.id },
        update: shop,
        create: shop,
      });
    }
    console.log(`✅ 遷移了 ${shops.length} 個商店`);

    // 3. 遷移午餐活動資料
    console.log('🍽️ 遷移午餐活動資料...');
    const events = await sqliteClient.lunchEvent.findMany();
    for (const event of events) {
      await postgresClient.lunchEvent.upsert({
        where: { id: event.id },
        update: event,
        create: event,
      });
    }
    console.log(`✅ 遷移了 ${events.length} 個活動`);

    console.log('🎉 資料遷移完成！');

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// 執行遷移
migrateData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

### 🔐 **Step 5: Supabase 特有功能設置**

#### 5.1 Row Level Security (RLS) 設置
```sql
-- 在 Supabase SQL Editor 中執行

-- 啟用 RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LunchEvent" ENABLE ROW LEVEL SECURITY;

-- 建立政策 (示例)
-- 允許所有認證用戶讀取公開資料
CREATE POLICY "允許讀取公開商店" ON "Shop"
  FOR SELECT TO authenticated
  USING (is_active = true);

-- 允許用戶讀取自己的資料
CREATE POLICY "用戶可讀取自己的資料" ON "User"
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id);

-- 允許活動創建者管理自己的活動
CREATE POLICY "活動創建者可管理活動" ON "LunchEvent"
  FOR ALL TO authenticated
  USING (auth.uid()::text = owner_id);
```

#### 5.2 即時訂閱設置 (選用)
```typescript
// services/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// 訂閱午餐活動更新
export const subscribeToLunchEvents = (callback: (payload: any) => void) => {
  return supabase
    .channel('lunch-events')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'LunchEvent' 
      }, 
      callback
    )
    .subscribe();
};

// 使用示例
// const subscription = subscribeToLunchEvents((payload) => {
//   console.log('活動更新:', payload);
// });
```

### 📱 **Step 6: 前端整合**

#### 6.1 更新服務層
```typescript
// services/lunch/lunch-event-services.ts
// 保持現有程式碼不變，只需要更新 import
import prisma from '@/services/prisma'; // 統一的 prisma 客戶端

// 其他程式碼保持不變...
```

#### 6.2 建立 Supabase Hook (選用)
```typescript
// hooks/use-supabase.ts
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useSupabase = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 獲取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, supabase };
};
```

### 🧪 **Step 7: 測試與驗證**

#### 7.1 本地測試
```bash
# 1. 確保本地仍使用 SQLite
NODE_ENV=development npm run dev

# 2. 測試生產環境配置
NODE_ENV=production DATABASE_PROVIDER=postgresql npm run build
```

#### 7.2 部署測試
```bash
# 1. 部署到 Vercel
vercel --prod

# 2. 檢查 Vercel 函數日誌
vercel logs

# 3. 測試 API 端點
curl https://your-app.vercel.app/api/lunch/events
```

### 🔄 **Step 8: 切換策略**

#### 8.1 漸進式切換
```typescript
// 建立功能開關
const USE_SUPABASE = process.env.ENABLE_SUPABASE === 'true';

// 在關鍵功能中使用
if (USE_SUPABASE) {
  // 使用 Supabase 功能
} else {
  // 使用原有功能
}
```

#### 8.2 A/B 測試
```typescript
// 根據用戶 ID 分流
const shouldUseSupabase = (userId: string) => {
  return parseInt(userId.slice(-1), 16) % 2 === 0;
};
```

### 📊 **Step 9: 監控與優化**

#### 9.1 Supabase 儀表板監控
- 資料庫效能指標
- API 使用統計
- 錯誤日誌分析
- 使用者認證統計

#### 9.2 效能優化
```typescript
// 連接池優化
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=20`,
    },
  },
});

// 查詢優化
const optimizedQuery = await prisma.lunchEvent.findMany({
  select: {
    id: true,
    title: true,
    event_date: true,
    // 只選擇需要的欄位
  },
  where: {
    is_active: true,
  },
  orderBy: {
    event_date: 'desc',
  },
  take: 20, // 限制結果數量
});
```

### 💰 **成本監控**
```bash
# 設置使用量警報
# 在 Supabase Dashboard > Settings > Billing
# - 設置每月使用量上限
# - 啟用使用量警報
# - 監控 API 請求次數
```

### 🔄 **回滾計畫**
如果需要回滾到 SQLite：
1. 更改環境變數 `DATABASE_PROVIDER=sqlite`
2. 重新部署應用程式
3. 從 Supabase 匯出資料到 SQLite (使用反向遷移腳本)

---

## 建議決策

### 基於不同需求的推薦

#### 🏃 快速原型 / MVP
**推薦**: Supabase 免費版
- 最快的設置時間
- 最慷慨的免費額度
- 豐富的開發工具

#### 💰 成本敏感 / 長期使用
**推薦**: 自託管 VPS
- 最低的運營成本
- 完全控制權
- 資源有效利用

#### 🔒 企業級 / 高可用性
**推薦**: Neon Pro 或 Supabase Pro
- 專業支援
- 自動備份和恢復
- SLA 保證

#### 🔧 學習導向 / 技術提升
**推薦**: 自託管 VPS
- 最佳學習機會
- 深度技術理解
- DevOps 技能提升

#### ⚡ 快速部署 / Vercel 整合
**推薦**: 直接使用 Neon 或 Supabase
- 不建議透過 Vercel Marketplace（額外複雜性）
- 直接註冊 Neon/Supabase 獲得更好支援
- 手動設置環境變數到 Vercel 專案

### 最終建議

考慮到你的具體情況：
- ✅ 已有 VPS 資源
- ✅ 運行 Discord Bot 經驗
- ✅ 成本考量重要
- ✅ 學習意願高

**強烈推薦使用自託管 VPS 方案**

這個方案不僅能最大化資源利用率，還能提供最佳的成本效益和學習價值。

---

## 實施路線圖

### Phase 1: 準備階段 (1-2 天)
- [ ] 評估現有 VPS 資源
- [ ] 設計 Docker Compose 配置
- [ ] 準備備份和監控腳本

### Phase 2: 部署階段 (1 天)
- [ ] 部署 PostgreSQL Docker 容器
- [ ] 配置網路和安全設置
- [ ] 執行初始資料遷移

### Phase 3: 測試階段 (3-5 天)
- [ ] 功能測試
- [ ] 效能測試  
- [ ] 災難恢復測試

### Phase 4: 上線階段 (1 天)
- [ ] 更新應用程式配置
- [ ] 監控部署
- [ ] 文檔化流程

---

## 結論

自託管 PostgreSQL 在你的 VPS 上是最佳選擇，既能有效利用現有資源，又能提供穩定可靠的資料庫服務。配合適當的監控和備份策略，這個方案能夠支撐專案的長期發展需求。

**下一步**: 開始準備 Docker Compose 配置和部署腳本。