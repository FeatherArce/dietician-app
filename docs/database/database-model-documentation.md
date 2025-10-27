# Lunch System 資料模型文檔

## 概述

本文檔詳細說明 Lunch System 的資料庫結構、模型關係和設計考量。

## 資料庫架構

### 技術選擇
- **資料庫**：SQLite (開發) / PostgreSQL (生產)
- **ORM**：Prisma
- **類型安全**：自動生成 TypeScript 類型

### 設計原則
- ✅ **正規化**：適當的資料正規化，避免冗餘
- ✅ **關係完整性**：合理的外鍵約束和關聯設計
- ✅ **擴展性**：支援未來功能擴展
- ✅ **效能考量**：適當的索引和查詢優化
- ✅ **軟刪除**：重要資料使用 `is_active` 軟刪除

## 核心模型

### 1. User（使用者）

```prisma
model User {
    id           String       @id @default(uuid())
    name         String
    email        String?      @unique // 準備 Auth.js
    note         String?
    ip           String?      // 改為可選
    role         UserRole     @default(USER)
    is_active    Boolean      @default(true)
    created_at   DateTime     @default(now())
    updated_at   DateTime     @updatedAt
    
    // 關聯
    joinedEvents LunchEvent[] @relation("LunchEventAttendees")
    ownedEvents  LunchEvent[] @relation("LunchEventOwner")
    orders       Order[]

    @@map("users")
}

enum UserRole {
    USER        // 一般使用者
    ADMIN       // 系統管理員（可維護商店與菜單）
    MODERATOR   // 管理者
}
```

**設計考量：**
- `email` 設為可選，為未來 Auth.js 整合做準備
- `ip` 保留作為備用識別方式
- `role` 枚舉支援階層式權限管理
- `is_active` 支援軟刪除，保留歷史資料

### 2. LunchEvent（訂餐事件）

```prisma
model LunchEvent {
    id             String    @id @default(uuid())
    title          String
    description    String?
    event_date     DateTime  @default(now()) // 用餐日期
    order_deadline DateTime  // 訂餐截止時間 ⭐
    start_at       DateTime? // 用餐開始時間
    end_at         DateTime? // 用餐結束時間
    location       String?   // 用餐地點
    is_active      Boolean   @default(true)
    created_at     DateTime  @default(now())
    updated_at     DateTime  @updatedAt
    
    // 發起人
    owner_id       String
    owner          User      @relation("LunchEventOwner", fields: [owner_id], references: [id])
    
    // 商店關聯（可選，支援自由輸入模式）⭐
    shop_id        String?   
    shop           Shop?     @relation(fields: [shop_id], references: [id])
    
    // 自由輸入模式 ⭐
    allow_custom_items Boolean @default(false)
    
    // 關聯
    attendees      User[]    @relation("LunchEventAttendees")
    orders         Order[]

    @@map("lunch_events")
}
```

**重要改進：**
- `order_deadline`：明確的訂餐截止時間
- `shop_id` 改為可選：支援不指定商店的自由輸入模式
- `allow_custom_items`：控制是否允許自由輸入餐點
- `event_date` vs `order_deadline`：清楚區分用餐日期和訂餐期限

### 3. Order & OrderItem（訂單系統）

```prisma
model Order {
    id         String      @id @default(uuid())
    created_at DateTime    @default(now())
    updated_at DateTime    @updatedAt
    total      Float       @default(0)
    note       String?     // 訂餐備註
    
    // 關聯
    user_id    String
    user       User        @relation(fields: [user_id], references: [id])
    event_id   String
    event      LunchEvent  @relation(fields: [event_id], references: [id])
    
    // 訂餐項目
    items      OrderItem[]

    @@unique([user_id, event_id]) // 每人每事件一訂單 ⭐
    @@map("orders")
}

model OrderItem {
    id          String  @id @default(uuid())
    name        String  // 餐點名稱
    price       Float   // 價格
    quantity    Int     @default(1) // 數量
    note        String? // 備註
    
    // 菜單項目關聯（可選，支援自由輸入）⭐
    menu_item_id String?
    menu_item    MenuItem? @relation(fields: [menu_item_id], references: [id])
    
    // 訂單關聯
    order_id    String
    order       Order   @relation(fields: [order_id], references: [id], onDelete: Cascade)
    
    @@map("order_items")
}
```

**重要設計：**
- **關聯模式取代 JSON**：OrderItem 獨立模型，更靈活且類型安全
- **唯一約束**：`@@unique([user_id, event_id])` 確保每人每事件只有一個訂單
- **可選菜單關聯**：`menu_item_id` 可為空，支援自由輸入模式
- **級聯刪除**：刪除訂單時自動刪除項目

### 4. Shop & Menu（商店菜單系統）

```prisma
model Shop {
    id         String       @id @default(uuid())
    name       String
    address    String?
    phone      String?
    email      String?
    website    String?      // 新增
    is_active  Boolean      @default(true) // 新增
    created_at DateTime     @default(now())
    updated_at DateTime     @updatedAt
    
    // 關聯（一對多）⭐
    menus      Menu[]       
    events     LunchEvent[]

    @@map("shops")
}

model Menu {
    id           String         @id @default(uuid())
    name         String
    description  String?
    is_available Boolean        @default(true)
    is_default   Boolean        @default(false) // 預設菜單 ⭐
    created_at   DateTime       @default(now())
    updated_at   DateTime       @updatedAt
    
    // 關聯
    shop_id      String
    shop         Shop           @relation(fields: [shop_id], references: [id])
    categories   MenuCategory[]
    items        MenuItem[]

    @@map("menus")
}

model MenuCategory {
    id          String     @id @default(uuid())
    name        String
    description String?
    sort_order  Int        @default(0) // 排序 ⭐
    is_active   Boolean    @default(true) // 啟用狀態 ⭐
    created_at  DateTime   @default(now())
    updated_at  DateTime   @updatedAt
    
    // 關聯
    menu_id     String
    menu        Menu       @relation(fields: [menu_id], references: [id])
    items       MenuItem[]

    @@map("menu_categories")
}

model MenuItem {
    id           String        @id @default(uuid())
    name         String
    description  String?       // 餐點描述 ⭐
    price        Float
    is_available Boolean       @default(true) // 可點選狀態 ⭐
    sort_order   Int           @default(0) // 排序 ⭐
    image_url    String?       // 餐點圖片 ⭐
    created_at   DateTime      @default(now())
    updated_at   DateTime      @updatedAt
    
    // 關聯
    menu_id      String
    menu         Menu          @relation(fields: [menu_id], references: [id])
    category_id  String?
    category     MenuCategory? @relation(fields: [category_id], references: [id])
    
    // 反向關聯
    order_items  OrderItem[]

    @@map("menu_items")
}
```

**重要改進：**
- **一對多關係**：Shop -> Menu 改為一對多，一個商店可有多個菜單
- **預設菜單**：`is_default` 標記商店的主要菜單
- **排序支援**：`sort_order` 支援自訂排序
- **可用性控制**：各層級都有 `is_active`/`is_available` 控制
- **豐富資訊**：項目支援描述、圖片等詳細資訊

## 關係圖

```
User (1) ──┐
           ├─→ LunchEvent (M) ─┐
           │                  ├─→ Order (M) ──→ OrderItem (M)
           └─→ Order (M) ─────┘                      │
                                                     │
Shop (1) ──→ Menu (M) ──→ MenuCategory (M)          │
                    │                                │
                    └─→ MenuItem (M) ←───────────────┘
```

**關係說明：**
- User ↔ LunchEvent：多對多（owner + attendees）
- User ↔ Order：一對多
- LunchEvent ↔ Order：一對多
- Order ↔ OrderItem：一對多
- Shop ↔ Menu：一對多
- Menu ↔ MenuCategory：一對多
- MenuCategory ↔ MenuItem：一對多
- MenuItem ↔ OrderItem：多對多

## 資料約束

### 商業邏輯約束
```sql
-- 訂餐截止時間必須早於事件日期
CHECK (order_deadline < event_date)

-- 每個商店只能有一個預設菜單
-- (在應用層處理)

-- 價格必須為正數
CHECK (price >= 0)

-- 數量必須為正數
CHECK (quantity > 0)
```

### 唯一性約束
```sql
-- 每個使用者在每個事件只能有一個訂單
UNIQUE (user_id, event_id)

-- 每個商店只能有一個預設菜單
-- (透過應用邏輯保證)

-- 使用者 email 唯一
UNIQUE (email)
```

## 索引策略

### 查詢效能索引
```sql
-- 事件查詢
CREATE INDEX idx_lunch_events_active ON lunch_events(is_active);
CREATE INDEX idx_lunch_events_date ON lunch_events(event_date);
CREATE INDEX idx_lunch_events_deadline ON lunch_events(order_deadline);
CREATE INDEX idx_lunch_events_owner ON lunch_events(owner_id);

-- 訂單查詢
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_date ON orders(created_at);

-- 菜單查詢
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

## 資料遷移策略

### 從舊版本升級
```typescript
// 1. 新增欄位（帶預設值）
// 2. 資料轉換
// 3. 移除舊欄位

// 範例：將 JSON items 轉為 OrderItem
const orders = await prisma.order.findMany({
    where: { items: { not: null } }
});

for (const order of orders) {
    const items = JSON.parse(order.items);
    await prisma.orderItem.createMany({
        data: items.map(item => ({
            order_id: order.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
        }))
    });
}
```

## 種子資料

### 開發環境初始化
```typescript
// prisma/seed.ts
async function main() {
    // 建立管理員使用者
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@example.com',
            role: 'ADMIN'
        }
    });

    // 建立範例商店
    const mcdonalds = await prisma.shop.create({
        data: {
            name: '麥當勞',
            phone: '02-1234-5678',
            website: 'https://mcdonalds.com.tw'
        }
    });

    // 建立範例菜單
    const menu = await prisma.menu.create({
        data: {
            name: '主菜單',
            shop_id: mcdonalds.id,
            is_default: true
        }
    });

    // 建立範例項目
    await prisma.menuItem.createMany({
        data: [
            {
                name: '大麥克',
                price: 120,
                menu_id: menu.id
            },
            {
                name: '薯條',
                price: 40,
                menu_id: menu.id
            }
        ]
    });
}
```

## 效能考量

### 查詢優化
```typescript
// 好的做法：使用 select 減少資料傳輸
const events = await prisma.lunchEvent.findMany({
    select: {
        id: true,
        title: true,
        event_date: true,
        owner: {
            select: { id: true, name: true }
        }
    }
});

// 好的做法：使用 include 一次獲取關聯資料
const event = await prisma.lunchEvent.findUnique({
    where: { id },
    include: {
        orders: {
            include: {
                items: true,
                user: {
                    select: { name: true }
                }
            }
        }
    }
});
```

### 批量操作
```typescript
// 批量建立
await prisma.orderItem.createMany({
    data: items.map(item => ({
        order_id: orderId,
        ...item
    }))
});

// 批量更新
await prisma.menuItem.updateMany({
    where: { menu_id: menuId },
    data: { is_available: false }
});
```

## 備份與恢復

### 定期備份
```bash
# SQLite 備份
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# PostgreSQL 備份
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 資料驗證
```typescript
// 定期檢查資料完整性
async function validateData() {
    // 檢查孤立的訂單項目
    const orphanItems = await prisma.orderItem.findMany({
        where: {
            order: null
        }
    });

    // 檢查無效的時間設定
    const invalidEvents = await prisma.lunchEvent.findMany({
        where: {
            order_deadline: {
                gte: prisma.lunchEvent.fields.event_date
            }
        }
    });
}
```

## 未來擴展

### 計劃中的功能
1. **通知系統**：事件提醒、訂單確認
2. **支付整合**：線上支付、費用分攤
3. **評價系統**：餐廳和餐點評分
4. **推薦系統**：基於歷史的個人化推薦
5. **報表分析**：消費統計、熱門餐點分析

### 架構準備
- **事件溯源**：保留所有操作歷史
- **多租戶**：支援多公司使用
- **國際化**：多語言和多時區支援
- **檔案存儲**：餐點圖片、發票存儲