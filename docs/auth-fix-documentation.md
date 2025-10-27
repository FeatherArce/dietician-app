# 認證問題修復說明

## 問題描述

在訂餐系統中出現"未授權訪問"錯誤，主要原因是前端 API 請求沒有包含必要的認證標頭。

## 根本原因

1. **認證機制不一致**：
   - 前端將 token 存儲在 `localStorage` 中
   - 後端 API 期望從 `cookies` 或 `Authorization` header 中讀取 token
   - 前端請求沒有包含 `Authorization` header

2. **受影響的 API 端點**：
   - `POST /api/lunch/orders` - 創建訂單
   - `PUT /api/lunch/orders` - 更新訂單  
   - `GET /api/lunch/orders` - 獲取用戶訂單
   - `GET /api/lunch/events/participated` - 獲取已參與活動
   - `GET /api/lunch/orders/user/{userId}/event/{eventId}` - 獲取特定訂單

## 修復方案

### 1. 修正現有請求

在所有需要認證的 API 請求中加入 `Authorization` header：

```typescript
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
  },
  // 其他選項...
});
```

### 2. 創建認證工具函數

新增 `src/libs/auth-fetch.ts` 提供統一的認證請求工具：

```typescript
// 自動帶認證的請求
import { authGet, authPost, authPut, authDelete } from '@/libs/auth-fetch';

// 使用範例
const data = await authGet('/api/lunch/orders');
const result = await authPost('/api/lunch/orders', orderData);
```

## 修復的檔案

### 前端頁面
- `src/app/lunch/page.tsx` - 主頁面的訂單和活動請求
- `src/app/lunch/(pages)/events/[id]/order/page.tsx` - 訂餐頁面的提交和查詢請求
- `src/app/lunch/events/[id]/join/page.tsx` - 分享頁面的訂單檢查請求

### 新增工具
- `src/libs/auth-fetch.ts` - 認證請求工具函數

## 修復詳情

### 1. 訂餐頁面 (`order/page.tsx`)
```typescript
// 修復前
const response = await fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

// 修復後  
const response = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
  },
  body: JSON.stringify(payload),
});
```

### 2. 主頁面 (`lunch/page.tsx`)
```typescript
// 修復前
const response = await fetch(`/api/lunch/orders?userId=${user.id}`);

// 修復後
const response = await fetch(`/api/lunch/orders?userId=${user.id}`, {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
  },
});
```

### 3. 分享頁面 (`join/page.tsx`)
```typescript
// 修復前
const orderResponse = await fetch(`/api/lunch/orders?userId=${user.id}&eventId=${eventId}`);

// 修復後
const orderResponse = await fetch(`/api/lunch/orders?userId=${user.id}&eventId=${eventId}`, {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
  },
});
```

## 未來改進建議

### 1. 使用統一的認證工具
建議將現有的 `fetch` 調用逐步替換為 `auth-fetch.ts` 中的工具函數：

```typescript
// 推薦方式
import { authPost } from '@/libs/auth-fetch';
const result = await authPost('/api/lunch/orders', orderData);

// 而非
const response = await fetch('/api/lunch/orders', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem('auth-token')}`,
  },
  body: JSON.stringify(orderData),
});
```

### 2. 考慮使用 HTTP-only Cookies
為了增強安全性，可以考慮：
- 將 token 存儲在 HTTP-only cookies 中
- 修改後端以優先從 cookies 讀取 token
- 減少 XSS 攻擊的風險

### 3. 錯誤處理改進
加入統一的錯誤處理機制：
- 401 錯誤自動導向登入頁面  
- 403 錯誤顯示權限不足提示
- 網路錯誤的友好提示

## 測試建議

1. **功能測試**：
   - ✅ 建立新訂單
   - ✅ 更新現有訂單
   - ✅ 查看訂單列表
   - ✅ 查看已參與活動
   - ✅ 透過分享連結參與活動

2. **認證測試**：
   - ✅ 正常登入用戶的操作
   - ✅ 未登入用戶的重導向
   - ✅ 過期 token 的處理

3. **邊界測試**：
   - ✅ 網路中斷情況
   - ✅ 伺服器錯誤處理
   - ✅ 無效 token 處理

## 總結

此次修復解決了訂餐系統中的認證問題，確保所有需要認證的 API 請求都正確包含認證標頭。同時提供了統一的認證工具函數，為未來的開發提供了更好的基礎。