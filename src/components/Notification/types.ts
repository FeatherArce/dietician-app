import { ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  className?: string;
}

export interface NotificationConfig {
  id?: string;
  type?: NotificationType;
  title?: string;
  message: string | ReactNode;
  duration?: number; // 顯示時間（毫秒），0 表示不自動關閉，modal 模式建議設為 0
  actions?: NotificationAction[];
  closable?: boolean;
  onClose?: () => void;
}

export interface NotificationItem extends Required<Omit<NotificationConfig, 'actions' | 'onClose'>> {
  id: string;
  actions?: NotificationAction[];
  onClose?: () => void;
  createdAt: number;
  // 當通知要求關閉時會被標記，讓 UI 能播放離場動畫後再真正移除
  isClosing?: boolean;
}