# OrderItem 快照模式設計說明

## 🎯 設計目標

解決歷史訂單資料完整性問題，確保訂單顯示的是**下單當時**的資訊，而不是**查看時**的最新資訊。

## 📊 資料結構對比

### ❌ 舊設計（僅關聯）
```typescript
// 問題：歷史訂單會隨菜單變動而改變
OrderItem {
    id: string
    quantity: number
    note?: string
    menu_item_id: string  // 僅外鍵關聯
    order_id: string
}
```

### ✅ 新設計（快照 + 可選關聯）
```typescript
// 解決：保存下單當時的完整資訊
OrderItem {
    id: string
    name: string          // 快照：餐點名稱
    price: number         // 快照：當時價格
    quantity: number      
    note?: string
    description?: string  // 快照：餐點描述
    category_name?: string // 快照：分類名稱
    menu_item_id?: string // 可選：用於統計追蹤
    order_id: string
}
```

## 🔧 實作方式

### 1. 從菜單項目建立訂單
```typescript
// 自動獲取菜單項目並建立快照
const orderItem = await orderService.createOrderItemFromMenuItem(
    'menu-item-uuid',
    2, // 數量
    '不要辣' // 備註
);

// 結果包含完整快照資料
console.log(orderItem);
// {
//   name: "麻婆豆腐飯",
//   price: 120,
//   quantity: 2,
//   note: "不要辣",
//   description: "經典川菜，香辣下飯",
//   category_name: "主餐",
//   menu_item_id: "menu-item-uuid"
// }
```

### 2. 自由輸入模式
```typescript
// 不關聯菜單項目的自由輸入
const customItem: CreateOrderItemData = {
    name: "客製化便當",
    price: 100,
    quantity: 1,
    description: "白飯 + 炒蛋 + 高麗菜",
    // menu_item_id 為空，表示自由輸入
};
```

### 3. 建立完整訂單
```typescript
const orderData: CreateOrderData = {
    user_id: "user-uuid",
    event_id: "event-uuid",
    note: "12:30 取餐",
    items: [
        // 從菜單選擇的項目
        await orderService.createOrderItemFromMenuItem('menu-item-1', 1),
        // 自由輸入的項目
        {
            name: "手工餅乾",
            price: 50,
            quantity: 2,
            description: "老闆娘手作"
        }
    ]
};

const order = await orderService.createOrder(orderData);
```

## 🗃️ 資料保護機制

### 菜單項目刪除保護
```sql
-- 當菜單項目被刪除時
DELETE FROM menu_items WHERE id = 'some-menu-item';

-- OrderItem 的行為：
-- ✅ menu_item_id 自動設為 NULL (onDelete: SetNull)
-- ✅ 快照資料完全保留 (name, price, description, category_name)
-- ✅ 歷史訂單顯示正常
```

### 菜單項目修改保護
```sql
-- 當菜單項目價格修改時
UPDATE menu_items SET price = 150 WHERE id = 'some-menu-item';

-- OrderItem 的行為：
-- ✅ 新訂單使用新價格 (150)
-- ✅ 歷史訂單顯示舊價格 (120)
-- ✅ 審計追蹤完整
```

## 📈 統計分析支援

### 熱門餐點分析
```typescript
// 透過 menu_item_id 統計（即使項目已修改）
async function getPopularItems(dateFrom: Date, dateTo: Date) {
    const stats = await prisma.orderItem.groupBy({
        by: ['menu_item_id'],
        where: {
            menu_item_id: { not: null },
            order: {
                created_at: {
                    gte: dateFrom,
                    lte: dateTo
                }
            }
        },
        _sum: { quantity: true },
        _count: { id: true }
    });

    // 獲取菜單項目名稱
    const results = await Promise.all(
        stats.map(async (stat) => {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: stat.menu_item_id! },
                select: { name: true }
            });
            
            return {
                menu_item_id: stat.menu_item_id,
                name: menuItem?.name || '已下架商品',
                total_quantity: stat._sum.quantity,
                order_count: stat._count.id
            };
        })
    );

    return results.sort((a, b) => b.total_quantity - a.total_quantity);
}
```

### 營收分析
```typescript
// 基於快照價格的準確營收計算
async function getRevenueAnalysis(eventId: string) {
    const orders = await prisma.order.findMany({
        where: { event_id: eventId },
        include: {
            items: true,
            user: { select: { name: true } }
        }
    });

    return {
        total_revenue: orders.reduce((sum, order) => sum + order.total, 0),
        total_orders: orders.length,
        avg_order_value: orders.length > 0 ? 
            orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
        items_analysis: orders.flatMap(order => 
            order.items.map(item => ({
                name: item.name, // 使用快照名稱
                price: item.price, // 使用快照價格
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }))
        )
    };
}
```

## 🔍 查詢範例

### 顯示歷史訂單
```typescript
// 訂單顯示始終使用快照資料
async function getOrderDisplay(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: true, // 使用快照資料顯示
            user: { select: { name: true } },
            event: { select: { title: true, event_date: true } }
        }
    });

    return {
        ...order,
        items: order.items.map(item => ({
            id: item.id,
            name: item.name,           // 下單時的名稱
            price: item.price,         // 下單時的價格
            quantity: item.quantity,
            note: item.note,
            description: item.description, // 下單時的描述
            category: item.category_name,  // 下單時的分類
            subtotal: item.price * item.quantity
        }))
    };
}
```

### 菜單項目歷史追蹤
```typescript
// 追蹤某個菜單項目的訂購歷史
async function getMenuItemOrderHistory(menuItemId: string) {
    const orderItems = await prisma.orderItem.findMany({
        where: { menu_item_id: menuItemId },
        include: {
            order: {
                include: {
                    event: { select: { title: true, event_date: true } },
                    user: { select: { name: true } }
                }
            }
        },
        orderBy: { order: { created_at: 'desc' } }
    });

    return orderItems.map(item => ({
        order_date: item.order.created_at,
        event_title: item.order.event.title,
        user_name: item.order.user.name,
        snapshot_name: item.name,     // 當時的名稱
        snapshot_price: item.price,   // 當時的價格
        quantity: item.quantity,
        note: item.note
    }));
}
```

## ✅ 最佳實踐

### 1. 建立訂單時
- **優先使用** `createOrderItemFromMenuItem()` 確保快照完整
- **自由輸入** 時手動提供完整資訊
- **驗證** 菜單項目可用性

### 2. 顯示訂單時
- **始終使用** OrderItem 的快照欄位
- **避免** join MenuItem 來顯示訂單內容
- **保持** 歷史資料的原貌

### 3. 統計分析時
- **使用** menu_item_id 做關聯統計
- **處理** 已刪除項目的情況
- **基於** 快照價格計算營收

### 4. 資料維護時
- **謹慎** 刪除菜單項目
- **建議** 使用 is_available 停用而非刪除
- **定期** 清理無關聯的孤立 OrderItem

## 🚀 遷移策略

如果從舊版本升級，需要遷移既有的 OrderItem 資料：

```typescript
// 遷移腳本範例
async function migrateOrderItems() {
    const orderItems = await prisma.orderItem.findMany({
        where: {
            // 找出缺少快照資料的項目
            OR: [
                { name: null },
                { price: null }
            ]
        },
        include: { menu_item: true }
    });

    for (const item of orderItems) {
        if (item.menu_item) {
            await prisma.orderItem.update({
                where: { id: item.id },
                data: {
                    name: item.menu_item.name,
                    price: item.menu_item.price,
                    description: item.menu_item.description
                }
            });
        }
    }
}
```

這種設計確保了：
- ✅ **歷史準確性**：訂單永遠反映下單當時的狀態
- ✅ **資料完整性**：即使菜單變動，歷史資料依然完整
- ✅ **統計能力**：可以追蹤菜單項目的歷史表現
- ✅ **彈性使用**：支援菜單選擇和自由輸入兩種模式