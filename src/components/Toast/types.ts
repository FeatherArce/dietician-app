import { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id?: string;
  type?: ToastType;
  message: string | ReactNode;
  duration?: number; // 顯示時間（毫秒），預設 4000
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
}

export interface ToastItem extends Required<Omit<ToastConfig, 'onClose'>> {
  id: string;
  onClose?: () => void;
  createdAt: number;
}