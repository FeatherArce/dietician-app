# Logs

## Daily Tasks

### 2025-10-25
- [x] 使用者管理 > Role 中文沒有對應 (管理員 > 系統管理員；版主 > 管理員)
- [x] 允許一般管理者新增商店
- [x] Fixed Notification API: global api not regester
- [x] Fixed Toast API: global api not regester
- [x] 新增的餐點如果跟既有餐點一致，則應直接整併數量
- [x] Fixed profile page
- [x] Fixed lunch event disable ui & loading
- [x] 進展 email 篩選規則: 排除生日、電話的數值組合

不執行
- 新增 guest 訂餐 => 後續實作通知、分析需要帳號
- 新增餐點選項 (Sizes、rice...) => 以備註的 shortcut link 實現

### 2025-11-02
- [x] Fixed vercel deploy middleware cann't recognize token correctly

### 2025-11-05
- [x] Fixed new account login won't redirect to /lunch, only occurs on vercel deploy
- [x] Admin function to turn custom order item to shop menu item

### 2025-11-07
- [x] 重作登入邏輯

### 2025-11-13
- [ ] 定義所有 api response 型別，並替換所有 services 與有使用到的地方

### 2025-12-01
- [x] 修正 shops/[id]/edit 找不到 shop 之問題
- [x] 調整邀請連結進入點餐的動線與流程
- [x] 新增菜單時要可以批次新增，也要可以暫存
- [ ] 新增所有菜單