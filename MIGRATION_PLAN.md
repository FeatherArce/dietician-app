# Auth.js (NextAuth v5) 遷移計畫

## 📋 概覽
從自建認證系統遷移到 auth.js（NextAuth v5），使用 Credentials Provider。

---

## ✅ 需要修改的檔案

### 1. **中間件層** 
**檔案**: `src/middleware.ts`
- ❌ 移除自訂 JWT 驗證邏輯
- ❌ 移除 `EdgeSessionService.verifyAccessToken()` 呼叫
- ✅ 改用 `auth()` 中間件驗證
- ✅ 使用 auth.js 內建的會話檢查

**變更內容**:
```typescript
// 舊方式
import { EdgeSessionService } from '@/services/server/auth/edge-session-service';

// 新方式
import { auth } from '@/libs/auth';
```

---

### 2. **客戶端 Hooks**
**檔案**: `src/hooks/useAuth.tsx`
- ❌ 移除 zustand auth store 的所有邏輯
- ✅ 改用 auth.js 的 `useSession()` hook
- ✅ 改用 auth.js 的 `signIn()` / `signOut()` 函數

**變更內容**:
```typescript
// 舊方式
export { useAuth, useAuthStore } from "@/stores/auth-store";

// 新方式
export { useSession } from "next-auth/react";
export { auth } from "@/libs/auth"; // 伺服器端
```

---

### 3. **認證提供者元件**
**檔案**: `src/components/AuthProvider.tsx`
- ❌ 移除自訂 AuthProvider（基於 zustand）
- ✅ 改用 auth.js 的 `SessionProvider`

**變更內容**:
```typescript
// 舊方式：基於 zustand 和手動 token 管理

// 新方式
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

---

### 4. **登入 API 路由**
**檔案**: `src/app/api/auth/login/route.ts`
- ⚠️ **可保留** 或 **完全刪除**
- 如果保留：改為調用 auth.js 的 signIn（需要改為 form action）
- **建議**: 改用 auth.js 的默認登入頁面或自訂表單

**替代方案**:
使用 auth.js 內建的 `/api/auth/signin` 或自訂表單

---

### 5. **登出 API 路由**
**檔案**: `src/app/api/auth/logout/route.ts`
- ❌ 完全刪除
- ✅ 改用 auth.js 的 `signOut()` 函數

---

### 6. **Refresh Token 路由**
**檔案**: `src/app/api/auth/refresh/route.ts`
- ❌ 完全刪除
- ✅ auth.js 自動處理 token 刷新

---

### 7. **Me（取得用戶信息）路由**
**檔案**: `src/app/api/auth/me/route.ts`
- ⚠️ **可保留**（如果前端需要）
- 改為使用 `auth()` 取得會話而不是驗證 JWT

**替代方案**:
```typescript
import { auth } from "@/libs/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ user: session.user });
}
```

---

### 8. **認證相關常數**
**檔案**: `src/constants/app-constants.ts`
- ⚠️ **部分可刪除** 或 **更新**
- 刪除：`ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, 自訂端點
- 保留：路由常數、重定向路徑等

**變更內容**:
```typescript
// 刪除這些（auth.js 自動處理）
// ACCESS_TOKEN_KEY
// REFRESH_TOKEN_KEY
// LOGIN_ENDPOINT
// LOGOUT_ENDPOINT
// REFRESH_ENDPOINT

// 保留或更新
LOGIN_REDIRECT: '/auth/login',
DEFAULT_REDIRECT_AFTER_LOGIN: '/lunch',
```

---

### 9. **認證 Fetch 工具**
**檔案**: `src/libs/auth-fetch.ts`
- ❌ 完全刪除或大幅簡化
- ✅ 改用標準 `fetch()` + auth.js 自動處理

**替代方案**:
使用 `fetch()` 配合 auth.js 的會話管理

---

### 10. **Auth Store**
**檔案**: `src/stores/auth-store.ts`
- ❌ **完全刪除**
- auth.js 負責會話管理，不需要 zustand

---

### 11. **登入頁面組件**
**檔案**: `src/app/auth/login/page.tsx`
- ✅ **改為使用 auth.js 的 signIn()**
- 更新表單處理邏輯

**變更內容**:
```typescript
'use client'
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleSubmit = async (formData: FormData) => {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: true,
      redirectTo: "/lunch"
    });
  };
  // ...
}
```

---

### 12. **註冊頁面組件**
**檔案**: `src/app/auth/register/page.tsx`
- ✅ **改為直接調用 register API**
- 無需改變 API 邏輯，只改前端集成

---

### 13. **其他受影響的組件**
尋找所有使用以下的組件，進行替換：
- `useAuthStore()` → `useSession()`
- `authFetch()` → `fetch()`
- `AUTH_CONSTANTS.ACCESS_TOKEN_KEY` → 刪除

**可能的檔案**:
- `src/components/Navbar.tsx`
- `src/components/AuthProvider.tsx`
- `src/components/LoadingIndicator.tsx`
- 任何使用 `useAuthStore` 的頁面

---

## 🗑️ 可以刪除的檔案

### 完全刪除（核心認證邏輯已被 auth.js 取代）

```
✗ src/services/server/auth/session-service.ts
✗ src/services/server/auth/edge-session-service.ts
✗ src/services/server/auth/edge-utils.ts
✗ src/services/server/auth/auth-service.ts
✗ src/services/server/auth/request-utils.ts
✗ src/stores/auth-store.ts
✗ src/libs/auth-fetch.ts
✗ src/app/api/auth/logout/route.ts
✗ src/app/api/auth/refresh/route.ts
```

### 可能刪除（如果沒有被使用）

```
~ src/app/api/auth/me/route.ts (可保留如果前端需要)
~ src/app/api/auth/login/route.ts (改為 form action)
~ src/app/api/auth/change-password/route.ts (自行評估)
~ src/app/api/auth/profile/route.ts (自行評估)
```

---

## 🔄 API 路由對應表

| 舊 API | 新 API | 狀態 |
|--------|--------|------|
| `/api/auth/login` (POST) | `/api/auth/signin` (auth.js) | 替換 |
| `/api/auth/logout` (POST) | `signOut()` (auth.js) | 刪除 |
| `/api/auth/refresh` (POST) | 自動(JWT) | 刪除 |
| `/api/auth/me` (GET) | `/api/auth/session` (auth.js) | 替換 |
| `/api/auth/register` (POST) | 保留 | 保留 |
| `/api/auth/profile` (PATCH) | 保留 | 保留 |
| `/api/auth/change-password` (POST) | 保留 | 保留 |

---

## 📝 修改優先度

### 第 1 優先（立即修改）
1. ✅ `src/libs/auth.ts` - 已完成
2. `src/middleware.ts` - 使用 auth.js 驗證
3. `src/components/AuthProvider.tsx` - SessionProvider 包裝

### 第 2 優先（必須修改）
4. `src/hooks/useAuth.tsx` - useSession 替換
5. `src/app/auth/login/page.tsx` - 表單改用 signIn()
6. 所有使用 `useAuthStore()` 的組件

### 第 3 優先（最後清理）
7. 刪除舊服務檔案
8. 更新常數檔案
9. 刪除 zustand store

---

## ⚠️ 注意事項

### 1. **Cookie 差異**
- 舊系統：手動設定 `auth-token` 和 `refresh-token`
- 新系統：auth.js 自動管理 `__Secure-next-auth.session-token`

### 2. **LocalStorage 依賴**
- 移除所有 `localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)` 的代碼
- auth.js token 儲存在 HTTP-Only cookie，客戶端無法存取

### 3. **型別安全**
- 確保所有使用 `useSession()` 的地方都有正確的型別檢查
- Session 物件結構已在 `auth.ts` 中定義

### 4. **中間件路由配置**
- 更新 `matcher` 配置（如需要）
- auth.js 會自動處理認證路由

---

## 🧪 測試清單

遷移後需要測試：

- [ ] 登入流程完整
- [ ] 登出功能正常
- [ ] Session 在頁面重新整理後保留
- [ ] 受保護路由正確重定向
- [ ] Token 過期時自動刷新（JWT）
- [ ] Cookie 設置正確（httpOnly, secure, sameSite）
- [ ] 前後端類型檢查無誤
- [ ] 生產環境部署正常

---

## 📚 相關文檔

- [Auth.js 官方文件](https://authjs.dev/)
- [Next.js 中間件](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Session 策略](https://authjs.dev/concepts/session-strategies#jwt-session)
