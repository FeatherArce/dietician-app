import React from 'react';
import { useToast } from './ToastProvider';
import { ToastConfig } from './types';

// 建立全域的 toast API
class ToastAPI {
  private addToast: ((config: ToastConfig) => string) | null = null;

  setAddFunction(addFn: (config: ToastConfig) => string) {
    this.addToast = addFn;
  }

  success(message: string | React.ReactNode, duration?: number) {
    if (!this.addToast) {
      console.warn('Toast not initialized. Please ensure ToastProvider is wrapped around your app.');
      return '';
    }
    return this.addToast({ message, type: 'success', duration });
  }

  error(message: string | React.ReactNode, duration?: number) {
    if (!this.addToast) {
      console.warn('Toast not initialized. Please ensure ToastProvider is wrapped around your app.');
      return '';
    }
    return this.addToast({ message, type: 'error', duration });
  }

  warning(message: string | React.ReactNode, duration?: number) {
    if (!this.addToast) {
      console.warn('Toast not initialized. Please ensure ToastProvider is wrapped around your app.');
      return '';
    }
    return this.addToast({ message, type: 'warning', duration });
  }

  info(message: string | React.ReactNode, duration?: number) {
    if (!this.addToast) {
      console.warn('Toast not initialized. Please ensure ToastProvider is wrapped around your app.');
      return '';
    }
    return this.addToast({ message, type: 'info', duration });
  }

  // 完整配置
  show(config: ToastConfig) {
    if (!this.addToast) {
      console.warn('Toast not initialized. Please ensure ToastProvider is wrapped around your app.');
      return '';
    }
    return this.addToast(config);
  }
}

export const toast = new ToastAPI();

// Hook for initializing the API
export const useToastAPI = () => {
  const { add } = useToast();
  
  // 初始化 API
  React.useEffect(() => {
    toast.setAddFunction(add);
  }, [add]);

  return toast;
};

// 重新匯出必要的元件和 hooks
export { ToastProvider } from './ToastProvider';
export { ToastContainer } from './ToastContainer';
export { useToast } from './ToastProvider';
export type { ToastConfig, ToastType } from './types';