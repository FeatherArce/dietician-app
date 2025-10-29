# SWR 與 Server Component 整合策略

## 🎯 方案 1: 混合模式 (已實作 ✅)

### 優點
- **首屏快速載入**：Server 預先獲取資料，無 loading 狀態
- **即時更新**：SWR 提供後續的即時更新與快取
- **最佳使用者體驗**：結合 SSR 與 CSR 的優點
- **SEO 友好**：初始資料在 HTML 中

### 架構
```tsx
// page.tsx (Server Component)
export default async function LunchPage() {
    const initialEvents = await getLunchEvents(); // Server-side
    return <LunchEventList initialData={initialEvents} />
}

// LunchEventList.tsx (Client Component)
export default function LunchEventList({ initialData }) {
    const { data: events } = useSWR('/api/lunch/events', fetcher, {
        fallbackData: initialData // 使用 Server 資料作為初始值
    });
}
```

## 🔄 方案 2: 純 SWR 模式

### 適用情況
- 資料更新頻繁
- 不需要 SEO
- 希望保持現有邏輯

```tsx
// 保持現狀，但優化組件拆分
export default function LunchEventList() {
    const { data: events } = useSWR('/api/lunch/events', fetcher);
    // ...
}
```

## 🚀 方案 3: 完全 Server 模式

### 適用情況
- 資料變更不頻繁
- 追求最佳效能
- 願意重構現有邏輯

```tsx
// 使用 Server Actions 處理所有操作
export default async function LunchPage() {
    const events = await getLunchEvents();
    
    async function addEvent(formData: FormData) {
        'use server'
        // 處理新增邏輯
        revalidatePath('/lunch');
    }
    
    return <LunchEventList events={events} addEvent={addEvent} />
}
```

## 📊 方案比較

| 特性 | 混合模式 | 純 SWR | 純 Server |
|------|----------|---------|-----------|
| 首屏速度 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 即時更新 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| SEO | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| 實作複雜度 | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Bundle 大小 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 🎯 推薦

**混合模式** 是最平衡的選擇，特別適合你目前的使用情境：
- 保留 SWR 的即時更新能力
- 獲得 Server Component 的效能優勢
- 最小化程式碼變更