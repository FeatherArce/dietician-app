# Middleware 身份驗證問題排查指南

## 🔍 問題症狀
- ✅ 本地測試：登入後正常自動跳轉到 `/lunch`
- ❌ Vercel 生產環境：登入成功但被重定向回登入頁面，持續循環

---

## 🎯 找到的問題

### 1️⃣ **Token 過期檢查缺失** ⚠️ 優先度最高
**位置**: `src/services/server/auth/edge-session-service.ts`

**問題**:
- `verifyAccessToken()` 驗證了 Token 的簽名，但**沒有檢查 `exp` 過期時間**
- 雖然 JWT 有內建的 `exp` 欄位，但若未在驗證時檢查，會導致過期 Token 仍被接受

**已修復**: ✅ 
- 添加了 `exp` 檢查邏輯
- 比較 Token 的 `exp` 與當前時間戳

---

### 2️⃣ **Middleware 調試日誌不足**
**位置**: `src/middleware.ts` - `validateSession()` 函式

**問題**:
- 缺少詳細的日誌記錄，難以在 Vercel 上排查
- 無法看到 Cookie 是否被正確傳遞

**已修復**: ✅
- 添加了完整的 `[MIDDLEWARE DEBUG]` 日誌
- 記錄 Token 存在狀態
- 記錄 Token 驗證結果和過期時間戳

---

### 3️⃣ **環境變數時間差異**
**可能原因**:
- Vercel 伺服器時間與本地時間存在偏差
- 導致 Token 被判定為已過期

**檢查方法**:
在 Vercel 日誌中查看以下輸出:
```
[TOKEN VERIFY] Token verified successfully: {
  exp: 1730xxxx,
  now: 1730xxxx,
  diff: -5
}
```
如果 `diff` 為正數且較大（> 100），表示 Token 已過期

---

### 4️⃣ **Cookie 跨域傳遞問題**（次要）
**可能原因**:
- Cookie 的 `SameSite` 設定可能導致跨域請求時遺失
- Cookie 的 `path` 屬性未正確設定

**當前設定**:
```typescript
response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',  // ✅ 正確設定
    maxAge: 24 * 60 * 60
});
```

---

## 🔧 排查步驟

### Step 1: 查看 Vercel 日誌
1. 登入 Vercel 儀表板
2. 找到你的專案 → Functions 或 Logs
3. 搜尋以下日誌:
   - `[MIDDLEWARE DEBUG]`
   - `[TOKEN VERIFY]`
   - `Unauthorized access attempt`

### Step 2: 檢查日誌中的時間戳
查看是否有以下輸出：
```
[TOKEN VERIFY] Token expired: {
  exp: 1730511234,
  now: 1730511500,
  diff: 266
}
```

如果出現這個，Token **確實已過期**。

### Step 3: 驗證 Token 生成時的過期時間
檢查 `src/services/server/auth/session-service.ts`:
```typescript
static readonly DEFAULT_EXPIRY = '7d';  // 應該是合理的時間
```

### Step 4: 檢查 Vercel 伺服器時間
在瀏覽器開發者工具的 Network 標籤中，檢查登入 API 響應的 Cookie：
- 確認 Cookie 中的時間戳是否正確設定

---

## 🚀 解決方案

### 方案 A: 增加 Token 有效期（臨時方案）
修改 `src/services/server/auth/session-service.ts`:
```typescript
// 從 '7d' 改為更長的時間
private static readonly DEFAULT_EXPIRY = '30d';
```

### 方案 B: 實現自動刷新 Token（推薦）
在前端創建一個 refresh token 機制：
1. 當 API 返回 401 時，自動調用 `/api/auth/refresh`
2. 刷新成功後重試原始請求

**範例**:
```typescript
// src/services/client/auth.ts 中添加
export async function refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    });
    return response.status === 200;
}
```

### 方案 C: 驗證伺服器時間同步
添加一個 API 路由來檢查伺服器時間：
```typescript
// src/app/api/auth/server-time/route.ts
export async function GET() {
    return NextResponse.json({
        serverTime: Math.floor(Date.now() / 1000),
        timestamp: new Date().toISOString()
    });
}
```

---

## 📋 檢查清單

- [ ] 已在 Vercel 日誌中查找 `[MIDDLEWARE DEBUG]` 和 `[TOKEN VERIFY]` 日誌
- [ ] 確認 Token 過期時間邏輯已修復
- [ ] 檢查 Vercel 伺服器時間是否與本地時間同步
- [ ] 測試使用較長的 `DEFAULT_EXPIRY` 值
- [ ] 在前端實現 Token 自動刷新機制
- [ ] 在本地環境重現問題（設定較短的過期時間進行測試）

---

## 🔗 相關文件
- `src/middleware.ts` - 中間件配置
- `src/services/server/auth/edge-session-service.ts` - Token 驗證邏輯
- `src/services/server/auth/session-service.ts` - Token 生成邏輯
- `src/app/api/auth/login/route.ts` - 登入 API

---

## ⚠️ 常見問題

### Q: 為什麼本地正常，Vercel 上不正常？
**A**: 最可能是時間差異或環境配置差異。Vercel Edge Runtime 可能使用不同的時區設定。

### Q: 如何確認是 Token 過期？
**A**: 檢查 Vercel 日誌中的 `diff` 值。如果為正數，Token 已過期。

### Q: Cookie 會被 Vercel 清除嗎？
**A**: 不會。但如果 `secure: true` 而 Cookie 未通過 HTTPS 傳遞，則會被瀏覽器忽略。

