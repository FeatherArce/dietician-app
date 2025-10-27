"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastConfig, ToastItem } from './types';

interface ToastContextType {
  toasts: ToastItem[];
  add: (config: ToastConfig) => string;
  remove: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const add = useCallback((config: ToastConfig): string => {
    const id = config.id || generateId();
    const toast: ToastItem = {
      id,
      type: config.type || 'info',
      message: config.message,
      duration: config.duration !== undefined ? config.duration : 4000,
      position: config.position || 'top-right',
      onClose: config.onClose,
      createdAt: Date.now(),
    };

    setToasts(prev => [...prev, toast]);

    // 自動關閉
    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }

    return id;
  }, [generateId, remove]);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove, clear }}>
      {children}
    </ToastContext.Provider>
  );
};