# 資料庫遷移執行指南

## 🎯 遷移概述

本指南詳細說明如何從 SQLite 開發環境平滑遷移到線上 PostgreSQL 生產環境，確保零停機和資料完整性。

## 📋 遷移前準備清單

### 技術準備
- [ ] 完成所有功能開發和測試
- [ ] 確認 Prisma schema 跨資料庫相容性
- [ ] 準備線上資料庫環境
- [ ] 設定備份策略
- [ ] 準備回滾計畫

### 環境準備
- [ ] 生產環境 PostgreSQL 資料庫
- [ ] SSL 憑證設定
- [ ] 環境變數配置
- [ ] 網路連線測試
- [ ] 權限設定確認

## 🔄 遷移執行步驟

### 步驟 1：資料庫相容性驗證

```bash
# 1.1 檢查 schema 在 PostgreSQL 的相容性
npx prisma db push --schema=./prisma/postgres/schema.prisma --dry-run

# 1.2 生成 PostgreSQL 遷移檔案
npx prisma migrate dev --schema=./prisma/postgres/schema.prisma --name init --create-only

# 1.3 檢視生成的 SQL
cat prisma/postgres/migrations/*/migration.sql
```

### 步驟 2：資料導出

```typescript
// scripts/export-sqlite-data.ts
import { PrismaClient as SQLiteClient } from '../prisma-generated/sqlite-client';

async function exportData() {
    const sqlite = new SQLiteClient();
    
    console.log('開始導出 SQLite 資料...');
    
    // 導出 Users
    const users = await sqlite.user.findMany({
        include: {
            oauth_accounts: true
        }
    });
    
    // 導出 LunchEvents
    const events = await sqlite.lunchEvent.findMany({
        include: {
            orders: {
                include: {
                    items: true
                }
            }
        }
    });
    
    // 導出 Shops 和相關資料
    const shops = await sqlite.shop.findMany({
        include: {
            menus: {
                include: {
                    categories: {
                        include: {
                            items: true
                        }
                    },
                    items: true
                }
            }
        }
    });
    
    // 儲存到 JSON 檔案
    const exportData = {
        users,
        events,
        shops,
        exportTime: new Date().toISOString(),
        counts: {
            users: users.length,
            events: events.length,
            shops: shops.length
        }
    };
    
    await fs.writeFile(
        './migration/sqlite-export.json', 
        JSON.stringify(exportData, null, 2)
    );
    
    console.log('SQLite 資料導出完成:', exportData.counts);
    await sqlite.$disconnect();
}
```

### 步驟 3：PostgreSQL 環境準備

```bash
# 3.1 建立 PostgreSQL 資料庫
createdb lunch_system_prod

# 3.2 設定環境變數
export POSTGRES_DATABASE_URL="postgresql://user:password@host:5432/lunch_system_prod"

# 3.3 執行初始遷移
npx prisma migrate deploy --schema=./prisma/postgres/schema.prisma

# 3.4 生成 PostgreSQL client
npx prisma generate --schema=./prisma/postgres/schema.prisma
```

### 步驟 4：資料導入

```typescript
// scripts/import-to-postgres.ts
import { PrismaClient as PostgreSQLClient } from '../prisma-generated/postgres-client';
import fs from 'fs/promises';

async function importData() {
    const postgres = new PostgreSQLClient();
    
    console.log('開始導入資料到 PostgreSQL...');
    
    // 讀取導出的資料
    const exportedData = JSON.parse(
        await fs.readFile('./migration/sqlite-export.json', 'utf-8')
    );
    
    try {
        await postgres.$transaction(async (tx) => {
            // 1. 導入 Users（保持 UUID）
            console.log('導入使用者資料...');
            for (const user of exportedData.users) {
                await tx.user.create({
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        password_hash: user.password_hash,
                        display_name: user.display_name,
                        role: user.role,
                        is_active: user.is_active,
                        email_verified: user.email_verified,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        last_login: user.last_login,
                        login_count: user.login_count
                    }
                });
                
                // 導入 OAuth accounts（如有）
                for (const account of user.oauth_accounts || []) {
                    await tx.oAuthAccount.create({
                        data: {
                            id: account.id,
                            user_id: user.id,
                            provider: account.provider,
                            provider_id: account.provider_id,
                            created_at: account.created_at
                        }
                    });
                }
            }
            
            // 2. 導入 Shops 和 Menus
            console.log('導入商店和菜單資料...');
            for (const shop of exportedData.shops) {
                await tx.shop.create({
                    data: {
                        id: shop.id,
                        name: shop.name,
                        address: shop.address,
                        phone: shop.phone,
                        email: shop.email,
                        website: shop.website,
                        is_active: shop.is_active,
                        created_at: shop.created_at,
                        updated_at: shop.updated_at
                    }
                });
                
                // 導入 Menus
                for (const menu of shop.menus || []) {
                    await tx.menu.create({
                        data: {
                            id: menu.id,
                            name: menu.name,
                            description: menu.description,
                            is_available: menu.is_available,
                            is_default: menu.is_default,
                            shop_id: shop.id,
                            created_at: menu.created_at,
                            updated_at: menu.updated_at
                        }
                    });
                    
                    // 導入 MenuCategories
                    for (const category of menu.categories || []) {
                        await tx.menuCategory.create({
                            data: {
                                id: category.id,
                                name: category.name,
                                description: category.description,
                                sort_order: category.sort_order,
                                is_active: category.is_active,
                                menu_id: menu.id,
                                created_at: category.created_at,
                                updated_at: category.updated_at
                            }
                        });
                    }
                    
                    // 導入 MenuItems
                    for (const item of menu.items || []) {
                        await tx.menuItem.create({
                            data: {
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                price: item.price,
                                is_available: item.is_available,
                                sort_order: item.sort_order,
                                image_url: item.image_url,
                                menu_id: menu.id,
                                category_id: item.category_id,
                                created_at: item.created_at,
                                updated_at: item.updated_at
                            }
                        });
                    }
                }
            }
            
            // 3. 導入 LunchEvents
            console.log('導入訂餐事件資料...');
            for (const event of exportedData.events) {
                await tx.lunchEvent.create({
                    data: {
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        event_date: event.event_date,
                        order_deadline: event.order_deadline,
                        start_at: event.start_at,
                        end_at: event.end_at,
                        location: event.location,
                        is_active: event.is_active,
                        owner_id: event.owner_id,
                        shop_id: event.shop_id,
                        allow_custom_items: event.allow_custom_items,
                        created_at: event.created_at,
                        updated_at: event.updated_at
                    }
                });
                
                // 導入 Orders
                for (const order of event.orders || []) {
                    await tx.order.create({
                        data: {
                            id: order.id,
                            user_id: order.user_id,
                            event_id: event.id,
                            total: order.total,
                            note: order.note,
                            created_at: order.created_at,
                            updated_at: order.updated_at
                        }
                    });
                    
                    // 導入 OrderItems
                    for (const item of order.items || []) {
                        await tx.orderItem.create({
                            data: {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                note: item.note,
                                description: item.description,
                                category_name: item.category_name,
                                menu_item_id: item.menu_item_id,
                                order_id: order.id
                            }
                        });
                    }
                }
            }
        });
        
        console.log('資料導入完成！');
        
    } catch (error) {
        console.error('資料導入失敗:', error);
        throw error;
    } finally {
        await postgres.$disconnect();
    }
}
```

### 步驟 5：資料完整性驗證

```typescript
// scripts/verify-migration.ts
async function verifyMigration() {
    const sqlite = new SQLiteClient();
    const postgres = new PostgreSQLClient();
    
    console.log('開始驗證資料遷移...');
    
    // 比較資料總數
    const sqliteCounts = {
        users: await sqlite.user.count(),
        events: await sqlite.lunchEvent.count(),
        orders: await sqlite.order.count(),
        orderItems: await sqlite.orderItem.count(),
        shops: await sqlite.shop.count(),
        menus: await sqlite.menu.count(),
        menuItems: await sqlite.menuItem.count()
    };
    
    const postgresCounts = {
        users: await postgres.user.count(),
        events: await postgres.lunchEvent.count(),
        orders: await postgres.order.count(),
        orderItems: await postgres.orderItem.count(),
        shops: await postgres.shop.count(),
        menus: await postgres.menu.count(),
        menuItems: await postgres.menuItem.count()
    };
    
    console.log('SQLite 資料統計:', sqliteCounts);
    console.log('PostgreSQL 資料統計:', postgresCounts);
    
    // 檢查是否一致
    const isConsistent = Object.keys(sqliteCounts).every(
        key => sqliteCounts[key] === postgresCounts[key]
    );
    
    if (isConsistent) {
        console.log('✅ 資料遷移驗證通過！');
    } else {
        console.log('❌ 資料遷移驗證失敗！');
        throw new Error('資料不一致');
    }
    
    // 功能測試
    console.log('執行功能測試...');
    
    // 測試認證功能
    const testUser = await postgres.user.findFirst();
    if (testUser) {
        console.log('✅ 使用者資料讀取正常');
    }
    
    // 測試關聯查詢
    const eventWithOrders = await postgres.lunchEvent.findFirst({
        include: {
            orders: {
                include: { items: true }
            }
        }
    });
    
    if (eventWithOrders) {
        console.log('✅ 關聯查詢正常');
    }
    
    await sqlite.$disconnect();
    await postgres.$disconnect();
    
    console.log('遷移驗證完成！');
}
```

### 步驟 6：應用程式切換

```typescript
// 6.1 更新 Prisma client 引用
// services/prisma.ts
export { PrismaClient } from '../prisma-generated/postgres-client';

// 6.2 更新環境變數
// .env.production
DATABASE_URL="postgresql://user:password@host:5432/lunch_system_prod"

// 6.3 重新建置應用程式
npm run build

// 6.4 執行最終測試
npm run test:e2e
```

## 🔧 遷移腳本

### 完整遷移腳本
```bash
#!/bin/bash
# migration/migrate.sh

set -e  # 遇到錯誤立即停止

echo "開始資料庫遷移..."

# 1. 備份當前 SQLite 資料庫
echo "備份 SQLite 資料庫..."
cp prisma/dev.db "backup/dev-$(date +%Y%m%d_%H%M%S).db"

# 2. 導出資料
echo "導出 SQLite 資料..."
npm run migration:export

# 3. 準備 PostgreSQL
echo "準備 PostgreSQL 環境..."
npm run migration:prepare-postgres

# 4. 導入資料
echo "導入資料到 PostgreSQL..."
npm run migration:import

# 5. 驗證資料
echo "驗證資料遷移..."
npm run migration:verify

# 6. 切換應用程式
echo "切換到 PostgreSQL..."
npm run migration:switch

echo "遷移完成！"
```

### package.json 腳本
```json
{
  "scripts": {
    "migration:export": "tsx scripts/export-sqlite-data.ts",
    "migration:prepare-postgres": "npx prisma migrate deploy --schema=./prisma/postgres/schema.prisma",
    "migration:import": "tsx scripts/import-to-postgres.ts", 
    "migration:verify": "tsx scripts/verify-migration.ts",
    "migration:switch": "tsx scripts/switch-to-postgres.ts",
    "migration:rollback": "tsx scripts/rollback-to-sqlite.ts"
  }
}
```

## 🛡️ 安全與備份

### 備份策略
```bash
# 遷移前完整備份
# 1. SQLite 檔案備份
cp prisma/dev.db backup/pre-migration-$(date +%Y%m%d).db

# 2. 程式碼快照
git tag v1.0.0-pre-migration
git push origin v1.0.0-pre-migration

# 3. 環境設定備份
cp .env.local backup/env-backup-$(date +%Y%m%d).txt
```

### 回滾計畫
```typescript
// scripts/rollback-to-sqlite.ts
async function rollback() {
    console.log('開始回滾到 SQLite...');
    
    // 1. 恢復 SQLite client 引用
    // 2. 恢復環境變數
    // 3. 重新建置應用程式
    // 4. 驗證功能正常
    
    console.log('回滾完成！');
}
```

## 📊 效能優化

### PostgreSQL 索引優化
```sql
-- 建立效能索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_lunch_events_date ON lunch_events(event_date);
CREATE INDEX idx_lunch_events_deadline ON lunch_events(order_deadline);
CREATE INDEX idx_orders_user_event ON orders(user_id, event_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
```

### 連線池設定
```typescript
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("POSTGRES_DATABASE_URL")
    shadowDatabaseUrl = env("POSTGRES_SHADOW_URL")
}

generator client {
    provider = "prisma-client-js"
    previewFeatures = ["postgresqlExtensions"]
}
```

## 🔍 監控與維護

### 遷移後監控
```typescript
// 關鍵指標監控
const monitoringChecks = {
    responseTime: "API 回應時間",
    errorRate: "錯誤率",
    connectionPool: "資料庫連線池使用率",
    queryPerformance: "查詢效能",
    memoryUsage: "記憶體使用量"
};
```

### 定期維護
```bash
# 每日備份
0 2 * * * pg_dump $DATABASE_URL > backup/daily-$(date +%Y%m%d).sql

# 每週真空清理
0 3 * * 0 psql $DATABASE_URL -c "VACUUM ANALYZE;"

# 每月索引重建
0 4 1 * * psql $DATABASE_URL -c "REINDEX DATABASE lunch_system_prod;"
```

## ✅ 遷移檢查清單

### 遷移前
- [ ] 所有功能測試通過
- [ ] 效能測試通過  
- [ ] 安全審計完成
- [ ] 備份策略確認
- [ ] 回滾計畫準備
- [ ] 監控系統就緒

### 遷移中
- [ ] 資料導出成功
- [ ] PostgreSQL 準備完成
- [ ] 資料導入成功
- [ ] 完整性驗證通過
- [ ] 功能測試通過
- [ ] 效能驗證通過

### 遷移後
- [ ] 生產環境功能正常
- [ ] 效能指標正常
- [ ] 監控告警正常
- [ ] 使用者回饋正面
- [ ] 備份機制運作
- [ ] 文檔更新完成

## 🎯 成功標準

### 技術指標
- 資料遷移 100% 成功，零資料遺失
- API 回應時間 < 200ms
- 查詢效能提升 > 50%
- 系統可用性 > 99.9%

### 業務指標  
- 使用者零感知切換
- 功能完整性 100%
- 使用者滿意度維持
- 零業務中斷

遵循這個遷移指南，可以確保從 SQLite 到 PostgreSQL 的平滑遷移，同時保持系統的穩定性和效能。