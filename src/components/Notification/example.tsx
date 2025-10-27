"use client";

import React from 'react';
import { Notification, useNotificationAPI } from '@/components/Notification';

/**
 * Notification 元件使用範例
 * 
 * 1. 首先在 App 層級包裝 NotificationProvider 和 NotificationContainer
 * 2. 在任何頁面或元件中使用 notification API
 */

export default function NotificationExample() {
  // 在元件中初始化 API（可選，也可以直接使用全域的 notification）
  useNotificationAPI();

  const showSuccessNotification = () => {
    Notification.success({
      title: '操作成功',
      message: '資料已成功儲存！',
      duration: 3000,
    });
  };

  const showErrorNotification = () => {
    Notification.error({
      title: '操作失敗',
      message: '伺服器連線異常，請稍後再試。',
      duration: 0, // 不自動關閉
      actions: [
        {
          label: '重試',
          onClick: () => {
            console.log('重試操作');
          },
          className: 'btn-primary'
        },
        {
          label: '取消',
          onClick: () => {
            console.log('取消操作');
          },
          className: 'btn-ghost'
        }
      ]
    });
  };

  const showWarningNotification = () => {
    Notification.warning({
      title: '注意',
      message: '您有未儲存的變更，離開頁面將會遺失資料。',
      actions: [
        {
          label: '儲存並離開',
          onClick: () => {
            console.log('儲存並離開');
          },
          className: 'btn-warning'
        }
      ]
    });
  };

  const showInfoNotification = () => {
    Notification.info({
      message: '系統將在 5 分鐘後進行維護。',
    });
  };

  const showCustomNotification = () => {
    Notification.open({
      type: 'success',
      title: '自訂通知',
      message: (
        <div>
          <p>這是一個包含 HTML 內容的通知</p>
          <ul className="list-disc list-inside mt-2">
            <li>支援 React 元件</li>
            <li>支援自訂樣式</li>
            <li>支援 Modal 對話框</li>
          </ul>
        </div>
      ),
      duration: 5000,
      actions: [
        {
          label: '了解更多',
          onClick: () => {
            window.open('https://daisyui.com/components/modal/', '_blank');
          },
          className: 'btn-primary'
        }
      ]
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Notification 元件範例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          className="btn btn-success"
          onClick={showSuccessNotification}
        >
          顯示成功通知
        </button>
        
        <button 
          className="btn btn-error"
          onClick={showErrorNotification}
        >
          顯示錯誤通知（含操作）
        </button>
        
        <button 
          className="btn btn-warning"
          onClick={showWarningNotification}
        >
          顯示警告通知
        </button>
        
        <button 
          className="btn btn-info"
          onClick={showInfoNotification}
        >
          顯示資訊通知
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={showCustomNotification}
        >
          顯示自訂通知
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">使用說明</h2>
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-medium mb-2">1. 在 layout.tsx 中設定</h3>
          <pre className="text-sm bg-base-300 p-2 rounded">
{`import { NotificationProvider, NotificationContainer } from '@/components/Notification';

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
}`}
          </pre>
          
          <h3 className="font-medium mb-2 mt-4">2. 在任何元件中使用</h3>
          <pre className="text-sm bg-base-300 p-2 rounded">
{`import { notification } from '@/components/Notification';

// 簡單用法
notification.success({ message: '操作成功！' });

// 完整用法
notification.error({
  title: '錯誤',
  message: '操作失敗',
  duration: 0,
  actions: [
    { label: '重試', onClick: () => retry() }
  ]
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}