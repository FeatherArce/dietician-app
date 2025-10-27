"use client";

import React from 'react';
import { Notification } from '@/components/Notification';
import Breadcrumb from '@/components/Breadcrumb';

export default function NotificationTestPage() {
  const showSuccess = () => {
    Notification.success({
      title: '操作成功',
      message: '資料已成功儲存！',
      duration: 3000,
    });
  };

  const showError = () => {
    Notification.error({
      title: '操作失敗', 
      message: '伺服器連線異常，請稍後再試。',
      duration: 0,
      actions: [
        {
          label: '重試',
          onClick: () => console.log('重試操作'),
          className: 'btn-primary btn-xs'
        },
        {
          label: '取消',
          onClick: () => console.log('取消操作'),
          className: 'btn-ghost btn-xs'
        }
      ]
    });
  };

  const showWarning = () => {
    Notification.warning({
      title: '注意',
      message: '您有未儲存的變更，離開頁面將會遺失資料。',
      actions: [
        {
          label: '儲存並離開',
          onClick: () => console.log('儲存並離開'),
          className: 'btn-warning'
        }
      ]
    });
  };

  const showInfo = () => {
    Notification.info({
      message: '系統將在 5 分鐘後進行維護。',
    });
  };

  const showCustom = () => {
    Notification.open({
      type: 'success',
      title: '自訂通知',
      message: (
        <div>
          <p>這是一個包含 HTML 內容的通知</p>
          <ul className="list-disc list-inside mt-2 text-xs">
            <li>支援 React 元件</li>
            <li>支援自訂樣式</li>
            <li>支援 Modal 對話框</li>
          </ul>
        </div>
      ),
      duration: 8000,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb 
        items={[
          { label: '首頁', href: '/' },
          { label: '元件測試', href: '/test' },
          { label: 'Notification 測試' }
        ]}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notification 元件測試</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button 
            className="btn btn-success"
            onClick={showSuccess}
          >
            成功通知
          </button>
          
          <button 
            className="btn btn-error"
            onClick={showError}
          >
            錯誤通知（含操作）
          </button>
          
          <button 
            className="btn btn-warning"
            onClick={showWarning}
          >
            警告通知
          </button>
          
          <button 
            className="btn btn-info"
            onClick={showInfo}
          >
            資訊通知
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={showCustom}
          >
            自訂通知
          </button>
        </div>

        <div className="bg-base-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">功能特色</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>類似 Ant Design notification 的 API 設計</li>
            <li>支援 success、error、warning、info 四種類型</li>
            <li>支援自訂標題、訊息內容和操作按鈕</li>
            <li>支援 6 種不同的顯示位置</li>
            <li>支援自動關閉或手動關閉</li>
            <li>支援 React 元件作為訊息內容</li>
            <li>基於 DaisyUI 的樣式設計</li>
            <li>包含淡入淡出動畫效果</li>
            <li>響應式設計，適配手機螢幕</li>
          </ul>
        </div>
      </div>
    </div>
  );
}