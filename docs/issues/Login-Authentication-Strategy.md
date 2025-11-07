# 登入認證系統設計文檔

**最後更新**：2025年11月7日  
**狀態**：進行中 - 遇到 httpOnly Cookie 與 localStorage 同步問題

## 目錄

1. [當前系統架構](#當前系統架構)
2. [認證狀態儲存方式](#認證狀態儲存方式)
3. [各種登入情況的處理流程](#各種登入情況的處理流程)
4. [已知問題](#已知問題)
5. [最佳實踐策略](#最佳實踐策略)

---

## 當前系統架構

### 三層驗證機制

```
┌─────────────────────────────────────────────────────┐
│                  前端層 (Next.js Client)             │
│  ├─ Zustand Auth Store (isAuthenticated, user)      │
│  └─ localStorage (auth-token)                        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              中介層 (Next.js Middleware)             │
│  ├─ validateSession() 驗證 httpOnly cookies         │
│  └─ 路由保護 (protected/auth/public routes)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│           伺服器層 (API Routes & Auth)               │
│  ├─ /api/auth/login (POST)                          │
│  ├─ /api/auth/me (GET) - 驗證當前使用者            │
│  ├─ /api/auth/logout (POST)                         │
│  └─ Session/Token 驗證                              │
└─────────────────────────────────────────────────────┘
```

### 各層的職責

| 層級 | 職責 | 驗證方式 |
|------|------|---------|
| **Middleware** | 路由保護、已登入使用者重定向 | 驗證 httpOnly cookies 中的 token |
| **API 層** | 業務邏輯驗證、資料操作 | 從 Authorization header 或 cookies 驗證 token |
| **前端** | UI 狀態管理、使用者體驗 | 依賴 Zustand store 的 isAuthenticated 狀態 |

---

## 認證狀態儲存方式

### 1. httpOnly Cookies（伺服器端設置）

**何時設置**：
- 使用者成功登入 (`/api/auth/login`)
- 使用者成功註冊 (`/api/auth/register`)

**儲存內容**：
```javascript
{
  "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**特性**：
- ✅ 前端 JavaScript 無法存取（安全性更好）
- ✅ 自動隨每個請求發送到伺服器
- ✅ 可設置 `secure` 標誌（HTTPS 才能發送）
- ❌ 前端無法檢查是否存在

**Cookie 設置配置**（來自 `/api/auth/login`）：
```typescript
response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 // 1 day
});
```

### 2. localStorage（前端設置）

**何時設置**：
- 登入成功後，前端呼叫 `login(user, token)` 儲存
- `/api/auth/me` 返回 token 時更新

**儲存內容**：
```javascript
{
  "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**特性**：
- ✅ 前端可隨時存取
- ✅ 頁面重新整理時持久保存
- ❌ 易受 XSS 攻擊（因此我們也使用 httpOnly cookies）
- ⚠️ 無法自動隨請求發送

### 3. Zustand Auth Store（前端狀態管理）

**狀態結構**：
```typescript
interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 方法
  login: (user, token) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

**初始化流程**：
```
1. 應用啟動 → AuthProvider 執行 initializeAuth()
2. initializeAuth() 呼叫 refreshUser()
3. refreshUser() 嘗試呼叫 /api/auth/me
4. 伺服器驗證 cookies 中的 token
5. 如果有效 → 返回 user 資料 + token
6. 前端存 token 到 localStorage，更新 Zustand store
```

---

## 各種登入情況的處理流程

### 情況 1：首次載入應用（無任何認證狀態）

```
使用者訪問 → [Middleware] → [AuthProvider.useEffect]
                            ↓
                    initializeAuth()
                            ↓
                    refreshUser()
                            ↓
                    呼叫 /api/auth/me
                            ↓
              無 token → 返回 401
                            ↓
         Zustand: isAuthenticated = false
                            ↓
              顯示登入頁面
```

### 情況 2：已登入狀態下刷新頁面

```
使用者刷新 → [Browser 發送 httpOnly cookies]
                            ↓
            [Middleware] 驗證 cookies 中的 token
                            ↓
                token 有效 → 通過
                            ↓
                [AuthProvider] initializeAuth()
                            ↓
                refreshUser() 呼叫 /api/auth/me
                            ↓
        [伺服器] 驗證 cookies 中的 token
                            ↓
            token 有效 → 返回 user + token
                            ↓
    前端 localStorage 存 token
    Zustand: isAuthenticated = true
                            ↓
        顯示已登入的內容
```

### 情況 3：使用者在登入頁面已登入

```
訪問 /auth/login → [Middleware] 驗證 cookies
                            ↓
            token 有效 → 重定向到 /lunch
                            ↓
        token 無效 → 通過到登入頁面
                            ↓
    前端 useEffect 再次驗證 token
                            ↓
        呼叫 /api/auth/me → 成功
                            ↓
        toast: "您已登入，正在跳轉..."
                            ↓
        重定向到 /lunch
```

### 情況 4：使用者登出

```
點擊登出 → logout()
                            ↓
    呼叫 /api/auth/logout API
                            ↓
    [伺服器] 清除 session
                            ↓
    [前端] 清除 localStorage
    [前端] 清除 Zustand store
                            ↓
    重定向到 /auth/login
```

---

## 已知問題

### 問題 1：httpOnly Cookie 與 localStorage 不同步

**症狀**：
```
[AUTH STORE] No token found, setting unauthenticated state
但 Middleware 能驗證到有效 token
```

**根本原因**：
1. 伺服器設置 httpOnly cookies
2. 前端 JavaScript 無法存取 httpOnly cookies
3. 如果登入後立即呼叫 `/api/auth/me`，但 localStorage 還沒更新
4. Zustand store 認為未登入，但伺服器認為已登入

**受影響的流程**：
- ❌ 新使用者登入/註冊後立即檢查狀態
- ❌ 頁面刷新時 localStorage 為空但 cookies 存在

### 問題 2：Middleware 在登入頁清除 Cookies

**症狀**：
```
登入後呼叫 /api/auth/me 返回 401
{error: "Not authenticated"}
```

**根本原因**：
登入頁面 (`/auth/login`) 在 middleware 的 `authRoutes` 中，當：
1. 使用者剛登入，cookies 被設置
2. 但前端 Zustand 狀態還沒更新
3. Middleware 再次驗證時認為 `isAuthenticated = false`
4. Middleware 清除了剛設置的 cookies

**解決方案**：
在登入頁面不清除 cookies，只記錄。讓 API 層和前端決定。

---

## 最佳實踐策略

### 1. 認證狀態初始化

#### ✅ 推薦方式

```typescript
// 在 AuthProvider 中
useEffect(() => {
  initializeAuth();
}, []);

// refreshUser 實作
const refreshUser = async () => {
  try {
    // 1. 總是嘗試呼叫 /api/auth/me
    //    即使 localStorage 沒有 token
    //    因為 httpOnly cookies 會自動發送
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      
      // 2. 確保 localStorage 有 token
      if (data.token) {
        localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, data.token);
      }
      
      // 3. 更新狀態
      set({
        user: data.user,
        isAuthenticated: true,
      });
    } else {
      // 4. 驗證失敗，清除狀態
      await logout();
    }
  } catch (error) {
    // 5. 網路錯誤，也清除狀態
    await logout();
  }
};
```

#### ❌ 避免的方式

```typescript
// 不要只依賴 localStorage 判斷
if (!localStorage.getItem('auth-token')) {
  return; // 這會導致 httpOnly cookies 被忽略
}
```

### 2. 登入後的狀態同步

#### ✅ 推薦流程

```typescript
// 1. 登入 API 返回
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({email, password}),
});

const result = await response.json();
// result: { user, token, message }

// 2. 前端立即存 token
login(user, token); // Zustand

// 3. localStorage 也被存
localStorage.setItem('auth-token', token);

// 4. 伺服器已設置 httpOnly cookies

// 5. 稍後重新整理頁面時
→ refreshUser() 從 API 驗證
→ localStorage, cookies, Zustand 都同步
```

### 3. 異常處理（Session/Cookie 過期）

#### 情況 A：只有 Cookie 過期

```
[API] 收到請求時 cookies 已過期
            ↓
    [伺服器] 驗證失敗 → 返回 401
            ↓
    [前端] 捕獲 401
            ↓
    logout() → 清除所有狀態
            ↓
    重定向到 /auth/login
            ↓
    toast: "登入已過期，請重新登入"
```

#### 情況 B：只有 localStorage 過期

```
[前端] localStorage 被清除
            ↓
    refreshUser() 仍嘗試呼叫 /api/auth/me
            ↓
    [伺服器] httpOnly cookies 仍有效
            ↓
    返回 user + token
            ↓
    [前端] 重新設置 localStorage
            ↓
    同步完成，無需重新登入
```

#### 情況 C：兩者都過期（最危險）

```
[前端] localStorage 過期，cookies 也過期
            ↓
    refreshUser() 呼叫 /api/auth/me
            ↓
    [伺服器] cookies 驗證失敗 → 401
            ↓
    logout() → 清除 Zustand
            ↓
    重定向到 /auth/login
```

### 4. 登出策略

#### ✅ 完整登出流程

```typescript
const logout = async () => {
  try {
    // 1. 通知伺服器（銷毀 session）
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    // 即使 API 失敗也要繼續清除前端狀態
    console.error('Logout API error:', error);
  } finally {
    // 2. 清除所有前端狀態
    localStorage.removeItem('auth-token');
    
    // 3. 清除 Zustand store
    set({
      user: null,
      isAuthenticated: false,
    });
    
    // 4. 不要在這裡重定向，讓呼叫者決定
    // window.location.href = '/auth/login';
  }
};
```

### 5. 路由保護策略

#### Middleware 的職責

```typescript
// ✅ 已登入使用者訪問認證路由
if (isAuthenticated && pathname === '/auth/login') {
  return redirect('/lunch'); // 重定向
}

// ✅ 未登入使用者訪問受保護路由
if (!isAuthenticated && pathname === '/lunch') {
  return redirect('/auth/login?redirect=/lunch'); // 重定向並保存目標
}

// ❌ 不要在認證路由清除 cookies
// 讓 API 層和前端決定
```

---

## 實作清單

### 已完成 ✅

- [x] 創建 Zustand Auth Store
- [x] 實現 httpOnly cookies 設置
- [x] 創建 `/api/auth/me` 端點
- [x] 修改 `refreshUser()` 總是嘗試驗證
- [x] 修改 `/api/auth/me` 返回 token
- [x] 移除 middleware 在登入頁清除 cookies 的邏輯

### 進行中 🔄

- [ ] 全面測試各種登入情況
- [ ] 驗證 cookie 安全設置（secure, sameSite）
- [ ] 測試 Token 過期流程
- [ ] 實現 Refresh Token 機制

### 待完成 📋

- [ ] 實現記住我（Remember Me）功能
- [ ] 實現雙因素認證（2FA）
- [ ] 實現 OAuth 整合（Google, Discord）
- [ ] 添加登入稽核日誌

---

## 測試檢查清單

### 本地開發測試

- [ ] 清空 cookies + localStorage，訪問應用 → 顯示登入頁
- [ ] 登入 → 檢查 cookies 和 localStorage 都存在
- [ ] 登入後刷新 → 仍保持登入狀態
- [ ] 登入後訪問 `/auth/login` → 重定向到 `/lunch`
- [ ] 登出 → 所有狀態清除，重定向到 `/auth/login`
- [ ] 手動刪除 localStorage 但 cookies 存在 → 仍能重新登入
- [ ] Token 過期 → 自動登出並顯示提示

### Vercel 生產環境測試

- [ ] HTTPS 環境下 cookies 正確設置
- [ ] 跨域請求 cookies 發送正確
- [ ] 網路不穩定時的狀態處理

---

## 相關檔案

- `/src/stores/auth-store.ts` - Zustand 認證狀態管理
- `/src/middleware.ts` - 路由保護和驗證
- `/src/app/api/auth/login/route.ts` - 登入 API
- `/src/app/api/auth/me/route.ts` - 當前使用者 API
- `/src/app/auth/login/page.tsx` - 登入頁面

---

## 參考資源

- [HTTP-only Cookies 安全性](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Zustand 文檔](https://github.com/pmndrs/zustand)
- [JWT 最佳實踐](https://tools.ietf.org/html/rfc8725)
