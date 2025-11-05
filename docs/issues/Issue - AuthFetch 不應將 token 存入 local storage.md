# Token 存儲方式的改進

## 背景
目前系統中 token 的存儲方式如下：
- **Cookie**：用於存儲 `ACCESS_TOKEN_KEY` 和 `REFRESH_TOKEN_KEY`，主要在後端 middleware 中使用。
- **LocalStorage**：在 `auth-fetch.ts` 中，`ACCESS_TOKEN_KEY` 被存儲於 LocalStorage，用於前端的自動認證和 token 刷新。

## 問題
1. **安全性**：
   - LocalStorage 中的 token 容易受到 XSS 攻擊。
   - 與 cookie 的混用可能導致存儲邏輯混亂。

2. **一致性**：
   - Token 的存取方式在前後端不一致，可能導致維護困難。

## 建議
1. **統一存儲方式**：
   - 考慮將 token 完全存儲在 `HttpOnly` 的 cookie 中，避免使用 LocalStorage。

2. **提高安全性**：
   - 如果必須使用 LocalStorage，需加強 XSS 防護措施。

## 後續處理
- 檢查系統中所有與 token 存取相關的邏輯，統一存儲方式。
- 評估將 token 完全移至 `HttpOnly` cookie 的可行性。
- 測試改動後的系統行為，確保不影響現有功能。
