import React from 'react';
import { useNotification } from './NotificationProvider';
import { NotificationConfig } from './types';

// 建立全域的 notification API，類似 Ant Design
class NotificationAPI {
  private addNotification: ((config: NotificationConfig) => string) | null = null;

  setAddFunction(addFn: (config: NotificationConfig) => string) {
    this.addNotification = addFn;
  }

  success(config: Omit<NotificationConfig, 'type'>) {
    if (!this.addNotification) {
      console.warn('Notification not initialized. Please ensure NotificationProvider is wrapped around your app.');
      return '';
    }
    return this.addNotification({ ...config, type: 'success' });
  }

  error(config: Omit<NotificationConfig, 'type'>) {
    if (!this.addNotification) {
      console.warn('Notification not initialized. Please ensure NotificationProvider is wrapped around your app.');
      return '';
    }
    return this.addNotification({ ...config, type: 'error' });
  }

  warning(config: Omit<NotificationConfig, 'type'>) {
    if (!this.addNotification) {
      console.warn('Notification not initialized. Please ensure NotificationProvider is wrapped around your app.');
      return '';
    }
    return this.addNotification({ ...config, type: 'warning' });
  }

  info(config: Omit<NotificationConfig, 'type'>) {
    if (!this.addNotification) {
      console.warn('Notification not initialized. Please ensure NotificationProvider is wrapped around your app.');
      return '';
    }
    return this.addNotification({ ...config, type: 'info' });
  }

  // 簡化的呼叫方式
  open(config: NotificationConfig) {
    if (!this.addNotification) {
      console.warn('Notification not initialized. Please ensure NotificationProvider is wrapped around your app.');
      return '';
    }
    return this.addNotification(config);
  }
}

export const Notification = new NotificationAPI();

// Hook for initializing the API
export const useNotificationAPI = () => {
  const { add } = useNotification();
  
  // 初始化 API
  React.useEffect(() => {
    Notification.setAddFunction(add);
  }, [add]);

  return Notification;
};

// 重新匯出必要的元件和 hooks
export { NotificationProvider } from './NotificationProvider';
export { NotificationContainer } from './NotificationContainer';
export { useNotification } from './NotificationProvider';
export type { NotificationConfig, NotificationAction, NotificationType } from './types';