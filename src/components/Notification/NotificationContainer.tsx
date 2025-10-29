"use client";

import React from 'react';
import { useNotification } from './NotificationProvider';
import { useNotificationAPI } from './index';
import { NotificationModal } from './NotificationToast';

export const NotificationContainer: React.FC = () => {
  // 確保全域 Notification API 在 container mount 時完成註冊
  useNotificationAPI();
  const { notifications, remove, requestClose } = useNotification();

  // 只顯示第一個通知（modal 一次只能顯示一個）
  const currentNotification = notifications[0];

  if (!currentNotification) {
    return null;
  }

  return (
    <NotificationModal
      notification={currentNotification}
      onRequestClose={requestClose}
      onFinalizeClose={remove}
    />
  );
};