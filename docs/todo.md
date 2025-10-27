# Common
- [ ] Discord Login / Auth.js 整合
- [ ] Deploy

# Lunch System

## ✅ 已完成
- [x] Prisma 模型重構
  - [x] 新增 UserRole 枚舉 (USER, MODERATOR, ADMIN)
  - [x] LunchEvent 新增 order_deadline 和 allow_custom_items
  - [x] Shop -> Menu 改為一對多關係
  - [x] Order -> OrderItem 關聯模式替代 JSON
  - [x] 完整的軟刪除支援
- [x] 完整服務層實作
  - [x] lunch-event-services.ts (事件管理 + 權限)
  - [x] order-services.ts (訂單 + 統計)
  - [x] shop-services.ts (商店 + 菜單管理)
  - [x] user-services.ts (使用者 + 權限系統)
- [x] API 路由重構
  - [x] 統一回應格式
  - [x] 錯誤處理標準化
  - [x] 服務層整合
- [x] 技術文檔
  - [x] Service Layer 文檔
  - [x] API 設計指南  
  - [x] 資料庫模型文檔

## 🔄 進行中
- [ ] Auth.js 整合 (已安裝 next-auth@beta)
- [ ] 資料庫遷移執行

## 📋 待完成

### 後端整合
- [ ] 執行 Prisma 遷移
  - [ ] `npx prisma generate`
  - [ ] `npx prisma db push`
  - [ ] 種子資料建立
- [ ] Auth.js 設定
  - [ ] 設定驗證提供者
  - [ ] 中介軟體權限檢查
  - [ ] 會話管理
- [ ] API 路由更新
  - [ ] 整合 Auth.js session
  - [ ] 權限檢查中介軟體
  - [ ] 測試所有端點

### 前端更新
- [ ] 使用者介面重構
  - [ ] 使用新的 API 端點
  - [ ] 權限控制顯示
  - [ ] 錯誤處理改善
- [ ] 組件更新
  - [ ] LunchEventForm (支援新欄位)
  - [ ] LunchEventList (權限顯示)
  - [ ] 新增 OrderForm 組件
  - [ ] 新增 MenuManagement 組件
- [ ] 狀態管理
  - [ ] SWR 整合新 API
  - [ ] 權限狀態管理
  - [ ] 錯誤狀態統一處理

### 功能增強
- [ ] 訂餐功能完善
  - [ ] 截止時間檢查
  - [ ] 自由輸入模式
  - [ ] 訂單修改功能
- [ ] 商店管理介面
  - [ ] 商店 CRUD
  - [ ] 菜單管理
  - [ ] 項目管理
- [ ] 使用者管理
  - [ ] 角色管理介面
  - [ ] 權限設定
- [ ] 報表功能
  - [ ] 訂單統計
  - [ ] 熱門餐點分析
  - [ ] 費用統計

### 測試與品質
- [ ] 單元測試
  - [ ] 服務層測試
  - [ ] API 路由測試
- [ ] 整合測試
  - [ ] 權限系統測試
  - [ ] 完整流程測試
- [ ] 效能優化
  - [ ] 查詢優化
  - [ ] 快取策略

### 部署準備
- [ ] 環境設定
  - [ ] 生產環境 PostgreSQL
  - [ ] 環境變數管理
- [ ] 容器化
  - [ ] Docker 設定
  - [ ] docker-compose 設定
- [ ] CI/CD
  - [ ] GitHub Actions
  - [ ] 自動測試
  - [ ] 自動部署

## 🎯 優先順序

### 第一階段：核心功能
1. 執行資料庫遷移
2. Auth.js 基本整合
3. 前端組件更新

### 第二階段：完整功能
1. 權限系統完善
2. 訂餐流程優化
3. 管理介面實作

### 第三階段：增強功能
1. 報表分析
2. 效能優化
3. 測試完善

### 第四階段：部署上線
1. 生產環境設定
2. 部署自動化
3. 監控告警
