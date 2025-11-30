# Lunch System Service Layer 文檔

## 概述

本文檔說明 Lunch System 的 Service Layer 架構，包含完整的商業邏輯、權限控制和資料操作。

## 架構設計

### Service Layer 優勢
- ✅ **商業邏輯集中化**：統一管理業務規則和驗證
- ✅ **權限與安全檢查**：內建角色權限和資料安全控制
- ✅ **完整的關聯查詢**：優化的資料庫查詢和關聯載入
- ✅ **統一的錯誤處理**：一致的錯誤格式和使用者友好訊息
- ✅ **類型安全**：完整的 TypeScript 類型定義
- ✅ **可重用性**：Service 可被 API Route、Server Component 等多處使用

### 目錄結構
```
services/lunch/
├── index.ts                    # 統一導出
├── lunch-event-services.ts     # 事件管理
├── order-services.ts           # 訂單管理
├── shop-services.ts            # 商店與菜單管理
└── user-services.ts            # 使用者與權限管理
```

## Service 詳細說明

### 1. Lunch Event Service

#### 功能概述
管理訂餐事件的完整生命週期，支援自由輸入模式和商店菜單模式。

#### 主要功能
```typescript
import { lunchEventService } from '@/services/lunch';

// 獲取事件列表（支援多重過濾）
const events = await lunchEventService.getEvents({
    isActive: true,
    ownerId: "user-id",
    eventDateFrom: new Date("2025-01-01"),
    allowCustomItems: true
});

// 獲取單一事件（包含完整關聯資料）
const event = await lunchEventService.getEventById("event-id");

// 新增事件
const newEvent = await lunchEventService.createEvent({
    title: "今天吃什麼",
    event_date: new Date("2025-01-10"),
    order_deadline: new Date("2025-01-09T10:00:00Z"),
    allow_custom_items: true, // 允許自由輸入餐點
    owner_id: "user-id",
    shop_id: "shop-id" // 可選
});
```

#### 重要功能
- **時間驗證**：自動檢查訂餐截止時間必須早於事件日期
- **訂餐期限檢查**：`isOrderingAvailable()` 檢查是否還能訂餐
- **使用者事件查詢**：`getUserEvents()` 獲取發起和參與的事件
- **完整關聯查詢**：包含擁有者、商店、菜單、訂單等完整資訊

### 2. Order Service

#### 功能概述
處理訂單的建立、修改、刪除，支援自由輸入和菜單選擇兩種模式。

#### 主要功能
```typescript
import { orderService } from '@/services/lunch';

// 建立訂單
const order = await orderService.createOrder({
    user_id: "user-id",
    event_id: "event-id",
    note: "不要辣",
    items: [
        {
            name: "牛肉麵",
            price: 120,
            quantity: 1,
            menu_item_id: null // 自由輸入模式
        },
        {
            name: "大麥克",
            price: 100,
            quantity: 2,
            menu_item_id: "menu-item-id" // 菜單選擇模式
        }
    ]
});

// 獲取使用者在特定事件的訂單
const userOrder = await orderService.getUserOrderForEvent("user-id", "event-id");

// 獲取事件的訂單統計
const summary = await orderService.getEventOrdersSummary("event-id");
```

#### 重要功能
- **期限驗證**：自動檢查訂餐截止時間
- **重複訂單檢查**：每個使用者每個事件只能有一個訂單
- **自動計算總價**：根據項目價格和數量自動計算
- **訂單統計**：提供事件的完整訂單統計和項目彙總

### 3. Shop & Menu Services

#### 功能概述
管理商店、菜單、分類和項目的完整層次結構。

#### 主要功能
```typescript
import { shopService, menuService, menuItemService } from '@/services/lunch';

// 商店管理
const shop = await shopService.createShop({
    name: "麥當勞",
    address: "台北市信義區",
    phone: "02-1234-5678",
    website: "https://mcdonalds.com.tw"
});

// 菜單管理
const menu = await menuService.createMenu({
    name: "主菜單",
    shop_id: shop.id,
    is_default: true // 設為預設菜單
});

// 項目管理
const item = await menuItemService.createItem({
    name: "大麥克",
    description: "經典漢堡",
    price: 120,
    menu_id: menu.id,
    category_id: "category-id",
    image_url: "https://example.com/image.jpg"
});
```

#### 重要功能
- **預設菜單邏輯**：自動處理每個商店只能有一個預設菜單
- **階層式查詢**：完整的 Shop -> Menu -> Category -> Item 關聯查詢
- **軟刪除處理**：刪除分類時自動將項目移到未分類
- **可用性控制**：支援商店、菜單、項目的啟用/停用狀態

### 4. User Service

#### 功能概述
管理使用者帳戶、角色權限和系統統計。

#### 主要功能
```typescript
import { userService, UserRole } from '@/services/lunch';

// 權限檢查
const hasPermission = await userService.checkUserPermission(
    "user-id", 
    UserRole.ADMIN
);

// 事件擁有者檢查
const isOwner = await userService.isEventOwner("user-id", "event-id");

// 訂單修改權限檢查
const canModify = await userService.canModifyOrder("user-id", "order-id");

// 使用者統計
const stats = await userService.getUserStats("user-id");
// { ownedEventsCount: 5, ordersCount: 12, totalSpent: 1500, activeEventsCount: 2 }

// 系統統計（管理員用）
const systemStats = await userService.getSystemStats();
```

#### 權限層級
```typescript
enum UserRole {
    USER        // 一般使用者：可建立事件、訂餐
    MODERATOR   // 管理者：額外權限
    ADMIN       // 系統管理員：可維護商店與菜單
}
```

#### 重要功能
- **階層式權限**：ADMIN > MODERATOR > USER
- **事件擁有權檢查**：驗證使用者是否為事件發起人
- **訂單修改權限**：結合時間限制和擁有權檢查
- **完整統計**：使用者和系統層級的統計資料

## 使用範例

### 完整的訂餐流程

```typescript
import { lunchEventService, orderService, userService } from '@/services/lunch';

// 1. 建立訂餐事件
const event = await lunchEventService.createEvent({
    title: "明天午餐團購",
    event_date: new Date("2025-01-10T12:00:00Z"),
    order_deadline: new Date("2025-01-09T10:00:00Z"),
    location: "公司一樓",
    allow_custom_items: true,
    owner_id: "organizer-id",
    shop_id: "mcdonalds-id"
});

// 2. 檢查訂餐是否開放
const canOrder = await lunchEventService.isOrderingAvailable(event.id);

// 3. 使用者下訂單
if (canOrder) {
    const order = await orderService.createOrder({
        user_id: "customer-id",
        event_id: event.id,
        items: [
            {
                name: "大麥克套餐",
                price: 149,
                quantity: 1,
                note: "去冰"
            }
        ]
    });
}

// 4. 修改訂單（期限內）
const canModify = await userService.canModifyOrder("customer-id", order.id);
if (canModify) {
    await orderService.updateOrder(order.id, {
        items: [
            {
                name: "大麥克套餐",
                price: 149,
                quantity: 2, // 改成 2 份
                note: "去冰"
            }
        ]
    });
}

// 5. 發起人查看統計
const summary = await orderService.getEventOrdersSummary(event.id);
console.log(`總訂單：${summary.totalOrders}，總金額：${summary.totalAmount}`);
```

### 商店菜單管理

```typescript
import { shopService, menuService, menuItemService } from '@/services/lunch';

// 1. 建立商店
const shop = await shopService.createShop({
    name: "珍煮丹",
    phone: "02-8888-9999"
});

// 2. 建立菜單
const menu = await menuService.createMenu({
    name: "飲品菜單",
    shop_id: shop.id,
    is_default: true
});

// 3. 新增飲品項目
const drinks = [
    { name: "黑糖珍珠鮮奶", price: 65 },
    { name: "芝芝芒果", price: 75 },
    { name: "翡翠檸檬", price: 55 }
];

for (const drink of drinks) {
    await menuItemService.createItem({
        ...drink,
        menu_id: menu.id
    });
}

// 4. 獲取完整商店資訊
const fullShop = await shopService.getShopById(shop.id);
```

## 錯誤處理

所有 Service 都有統一的錯誤處理機制：

```typescript
try {
    const order = await orderService.createOrder(orderData);
} catch (error) {
    // error.message 包含使用者友好的錯誤訊息
    console.error(error.message);
    // 例如："已超過訂餐截止時間"
    //      "您已經在此事件中有訂單，請使用更新功能"
    //      "事件不存在或已關閉"
}
```

## 最佳實踐

### 1. API Route 中使用
```typescript
// app/api/lunch/events/route.ts
import { lunchEventService } from '@/services/lunch';

export async function GET(request: NextRequest) {
    try {
        const events = await lunchEventService.getEvents();
        return NextResponse.json({ events, success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error.message, success: false }, 
            { status: 500 }
        );
    }
}
```

### 2. Server Component 中使用
```typescript
// app/lunch/page.tsx
import { lunchEventService } from '@/services/lunch';

export default async function LunchPage() {
    const events = await lunchEventService.getEvents({ isActive: true });
    
    return <LunchEventList initialData={events} />;
}
```

### 3. 權限檢查
```typescript
// 在任何需要權限的操作前
const hasPermission = await userService.checkUserPermission(
    userId, 
    UserRole.ADMIN
);

if (!hasPermission) {
    throw new Error('權限不足');
}
```

## 注意事項

1. **時間處理**：所有時間相關的驗證都在 Service Layer 處理
2. **權限檢查**：重要操作都需要進行權限驗證
3. **錯誤訊息**：提供使用者友好的錯誤訊息
4. **資料完整性**：自動處理關聯資料的一致性
5. **效能優化**：使用適當的 include 和 select 減少資料庫查詢

## 未來擴展

Service Layer 設計支援未來的功能擴展：

- **通知系統**：在 Service 中加入事件通知
- **快取機制**：為頻繁查詢的資料加入快取
- **審計日誌**：記錄重要操作的歷史
- **批量操作**：支援批量建立訂單等操作
- **報表功能**：基於現有統計功能擴展報表