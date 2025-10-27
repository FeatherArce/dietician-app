"use client";

import React from 'react';
import { useNotification } from './NotificationProvider';
import { NotificationModal } from './NotificationToast';

export const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotification();

  // 只顯示第一個通知（modal 一次只能顯示一個）
  const currentNotification = notifications[0];

  if (!currentNotification) {
    return null;
  }

  return (
    <NotificationModal
      notification={currentNotification}
      onClose={remove}
    />
  );
};