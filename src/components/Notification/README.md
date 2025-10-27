# Notification 元件

基於 DaisyUI Modal 的通知元件，提供類似 Ant Design notification 的 API 設計。

## 功能特色

- 🎯 類似 Ant Design notification 的 API 設計
- 📱 響應式設計，支援手機螢幕
- 🎨 基於 DaisyUI Modal 的樣式系統
- ✨ 支援淡入淡出動畫效果
- 🔧 支援自訂操作按鈕
- 📍 居中顯示，一次只顯示一個通知
- ⏰ 支援自動關閉或手動關閉
- 🧩 支援 React 元件作為訊息內容

## 快速開始

### 1. 設定 Provider

在您的 `layout.tsx` 中包裝 `NotificationProvider` 和 `NotificationContainer`：

```tsx
import { NotificationProvider, NotificationContainer } from '@/components/Notification';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### 2. 基本使用

```tsx
import { notification } from '@/components/Notification';

// 成功通知
notification.success({
  message: '操作成功！'
});

// 錯誤通知
notification.error({
  title: '操作失敗',
  message: '請檢查網路連線後重試'
});

// 警告通知
notification.warning({
  message: '您有未儲存的變更'
});

// 資訊通知
notification.info({
  message: '系統將於 5 分鐘後維護'
});
```

## API 參考

### notification.success(config)
### notification.error(config)
### notification.warning(config)
### notification.info(config)
### notification.open(config)

#### 配置參數 (NotificationConfig)

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `message` | `string \| ReactNode` | - | 通知內容（必填） |
| `title` | `string` | - | 通知標題 |
| `duration` | `number` | `0` | 顯示時間（毫秒），0 表示不自動關閉 |
| `actions` | `NotificationAction[]` | - | 操作按鈕 |
| `closable` | `boolean` | `true` | 是否顯示關閉按鈕 |
| `onClose` | `() => void` | - | 關閉時的回調函數 |

#### 操作按鈕配置 (NotificationAction)

| 參數 | 類型 | 說明 |
|------|------|------|
| `label` | `string` | 按鈕文字 |
| `onClick` | `() => void` | 點擊事件 |
| `className` | `string` | 按鈕樣式類別 |

## 使用範例

### 帶操作按鈕的確認對話框

```tsx
notification.warning({
  title: '確認刪除',
  message: '此操作無法復原，確定要刪除嗎？',
  actions: [
    {
      label: '確認刪除',
      onClick: () => handleDelete(),
      className: 'btn-error'
    },
    {
      label: '取消',
      onClick: () => {}, // 空函數，modal 會自動關閉
      className: 'btn-ghost'
    }
  ]
});
```

### 自訂內容

```tsx
notification.open({
  type: 'info',
  title: '系統公告',
  message: (
    <div>
      <p>系統將於今晚進行維護</p>
      <ul className="list-disc list-inside mt-2">
        <li>維護時間：23:00 - 02:00</li>
        <li>影響功能：訂餐系統</li>
      </ul>
    </div>
  ),
  duration: 8000
});
```

### 簡單提示

```tsx
notification.success({
  title: '操作成功',
  message: '資料已儲存！',
  duration: 3000 // 3秒後自動關閉
});
```

## 設計原則

- **一次一個**：Modal 一次只顯示一個通知，後來的通知會加入佇列
- **居中顯示**：所有通知都在螢幕中央顯示
- **手動確認**：預設不自動關閉，需要使用者確認或手動關閉
- **清晰明確**：使用適當的圖示和顏色來表達通知類型

## 樣式自訂

通知元件使用 DaisyUI 的 Modal 樣式。您可以透過 CSS 自訂樣式：

```css
/* 自訂 Modal 尺寸 */
.modal-box.notification-modal {
  max-width: 28rem;
  border-radius: 0.75rem;
}

/* 手機版響應式 */
@media (max-width: 640px) {
  .modal-box.notification-modal {
    max-width: calc(100vw - 2rem);
    margin: 1rem;
  }
}
```

## 注意事項

1. 確保在應用程式根層級設定 `NotificationProvider`
2. `NotificationContainer` 應放在所有其他內容之後
3. Modal 會自動處理 z-index，確保顯示在最上層
4. 在 SSR 環境中，通知只在客戶端渲染後才會顯示
5. 建議確認對話框設定 `duration: 0`，讓使用者手動確認

## 測試頁面

訪問 `/test/notification` 查看所有功能的示例。