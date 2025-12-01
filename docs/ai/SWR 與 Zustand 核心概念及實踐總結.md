# 📚 SWR 與 Zustand 核心概念及實踐總結

本次對話深入探討了 **Vercel SWR** (資料獲取) 與 **Zustand** (客戶端狀態管理) 函式庫，並討論了在現代 React 應用程式中如何高效地結合使用它們，特別是關於資料更新和 React 並發特性的應用。

## 1\. 核心函式庫介紹

| 函式庫 | 類型 | 適用場景 | 核心優勢 |
| :--- | :--- | :--- | :--- |
| **Vercel SWR** | 資料獲取/緩存 | **伺服器狀態 (Server State)**：來自 API 的資料。 | 基於 Stale-While-Revalidate 策略，提供自動緩存、背景重新驗證、優化 UX。 |
| **Zustand** | 狀態管理 | **客戶端狀態 (Client State)**：UI 偏好、Modal 開關、全域篩選。 | 極簡、輕量、高性能，避免 React Context 的過度渲染，易於在組件外操作。 |

## 2\. 實戰情境劃分 (帳號管理頁面)

在一個帳號檢視與編輯的應用程式中，我們建議：

| 狀態內容 | 狀態類型 | 建議函式庫 |
| :--- | :--- | :--- |
| 帳號列表資料、單一帳號詳細資料 | **伺服器狀態** | **SWR** (使用 `useSWR`) |
| 新增帳號 Modal/彈窗的開關狀態 | **客戶端 UI 狀態** | **Zustand** (使用 Store) |
| 列表的篩選條件（例如：`status=active`） | **客戶端 UI 狀態** | **Zustand** (影響 SWR 的 Key) |

## 3\. SWR 的高效數據更新技巧 (`mutate`)

當執行新增、更新或刪除操作後，應使用 SWR 的 `mutate` 函式來**手動更新緩存**，避免重新獲取整個列表，從而提升效能和即時性。

### A. 更新/新增 (局部緩存替換)

使用 `mutate` 傳入一個**更新函式**，將 API 回傳的最新單一物件，替換掉列表中的舊物件。

```javascript
// 使用繫結的 mutate 示範
await listMutate(
    (oldUsersData) => {
        // 遍歷舊列表，找到並替換該筆資料
        return oldUsersData.map(user => 
            user.id === updatedUser.id ? updatedUser : user
        );
    }, 
    { revalidate: false } // 不觸發重新獲取
);
```

### B. 刪除 (局部緩存移除與樂觀回滾)

使用 `mutate` 執行樂觀刪除，並利用 `rollbackOnError: true` 確保失敗時資料能自動還原。

```javascript
// 標準樂觀刪除模式 (確保回滾機制生效)
await listMutate(
    async (oldUsersData) => { 
        // 1. 立即更新緩存 (樂觀刪除)
        const newUsersData = oldUsersData.filter(user => user.id !== userId);
        
        // 2. 執行 API 請求 (SWR 會監聽這個 Promise 的結果)
        await deleteUser(userId); 
        
        return newUsersData; // 成功則返回已刪除的新數據
    },
    { 
        rollbackOnError: true, // 啟用自動回滾
        revalidate: false      
    }
);
```

### C. `mutate` 的作用域

  * **繫結的 `mutate`** (從 `useSWR` Hook 回傳)：已鎖定 Key，無需傳入 Key 參數，適合操作當前 Hook 追蹤的緩存。
  * **全局的 `mutate`** (從 `import { mutate }` 導入)：需傳入 Key 參數，適合跨組件或在組件外部操作緩存。

## 4\. SWR 與 React `useTransition` 的整合

### A. 使用原則

`useTransition` (或 `startTransition`) 應用於當**使用者互動**導致 SWR 的 **Key 發生變化**時。

### B. 目的

防止應用程式在等待新資料獲取期間出現硬式的載入 Spinner 或卡頓，讓 React 保持舊的 UI 響應，同時在背景渲染新內容。

### C. 結論：**不**應包裹 `mutate`

  * **應包裹：** 應包裹**改變 SWR Key 的那個 `setState` 狀態更新**（例如：`startTransition(() => setSelectedCategory('new'))`）。
  * **不應包裹 `mutate`：** `mutate` 的目標是即時更新或觸發背景驗證，其操作本質上是非阻塞的。將樂觀更新包裹在 `startTransition` 內反而可能延遲即時 UI 反饋。


## 5. SWR 與 React `useTransition` 載入狀態使用指南

在現代 React 應用程式中，區分 SWR 的內建狀態與 React 並發特性提供的狀態，對於提供流暢的使用者體驗至關重要。

### 1\. 核心狀態區分

在處理資料獲取時，有兩種主要的載入狀態需要區分：

| 狀態名稱 | 來源 | 定義與用途 | 介面視覺效果 |
| :--- | :--- | :--- | :--- |
| **`isLoading`** | SWR Hook (`useSWR`) | **初次載入狀態 (First Load)**：當 SWR 首次獲取資料，緩存為空時的載入狀態。 | 顯示 **硬式載入 Spinner** 或 **骨架屏** (Skeleton Screen)。 |
| **`isRefreshing`** | SWR Hook (`useSWR`) | **背景驗證狀態 (Revalidating)**：緩存中已有舊資料，SWR 在背景獲取新資料。 | **不顯示阻塞型動畫**，舊資料保持可見。 |
| **`isPending`** | `useTransition` Hook | **非緊急過渡狀態**：當 SWR Key 變更，但 React 允許舊 UI 保持響應，等待新 UI 渲染。 | **舊內容保持顯示**，可能伴隨非阻塞的視覺提示（例如內容變灰、透明度降低）。 |

### 2\. 實際操作時機與模式

| 操作類型 | 觸發機制 | 建議載入狀態 | 為什麼？ |
| :--- | :--- | :--- | :--- |
| **頁面/組件初始化** | SWR 首次執行 (`key` 存在且無緩存) | **`isLoading`** | 必須等待資料，此時沒有舊資料可顯示，需阻塞。 |
| **使用者變更篩選/分頁** | 狀態更新 $\rightarrow$ **SWR Key 變更** | **`isPending`** (需搭配 `startTransition`) | 避免舊內容被硬式 Spinner 取代，提供平滑過渡。 |
| **背景自動重新驗證** | 視窗聚焦、網路重連 | **`isRefreshing`** | 舊資料仍然有效，應保持 UI 穩定，不應有明顯的載入動畫。 |
| **行為驅動的數據變更 (POST/DELETE)** | 執行 `mutate` (樂觀更新) | **`isDeleting`/`isUpdating`** (`useState`) | 這是單獨的異步行為，應使用 `useState` 或 `useSWRMutation` 提供的狀態，來追蹤按鈕級別的精確生命週期。 |

### 3\. `startTransition` 應用模式 (範例)

使用 `startTransition` 的核心是包裹**觸發 SWR Key 變更**的那個 `setState` 呼叫：

```jsx
import { useState, useTransition } from 'react';

// ... SWR Hook 依賴於 filterValue

const [isPending, startTransition] = useTransition(); 
const [filterValue, setFilterValue] = useState('all');

const handleFilterChange = (newFilter) => {
    // 將會改變 SWR Key 的狀態更新標記為非緊急
    startTransition(() => {
        setFilterValue(newFilter); 
    });
};

// 介面渲染：
return (
    <div>
        {/* 1. 處理初次載入或錯誤 (使用 SWR 內建狀態) */}
        {isLoading && <Skeleton />} 
        {error && <ErrorDisplay />}

        {/* 2. 處理過渡狀態 (使用 isPending) */}
        {isPending && <div className="transition-overlay">更新中...</div>}
        
        {/* 3. 顯示內容 (當 isPending 時，舊的內容保持可見) */}
        {/* ... List UI ... */}
    </div>
);
```

### ❗ 重要提醒

**絕對不要**將**行為驅動**的載入狀態（例如：刪除中的 `isDeleting`）或**初次載入**狀態（`isLoading`）包裹在 `startTransition` 內。這會導致邏輯混亂，並削弱樂觀更新的即時性。