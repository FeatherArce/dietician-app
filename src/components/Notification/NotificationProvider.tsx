"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationConfig, NotificationItem } from './types';

interface NotificationContextType {
  notifications: NotificationItem[];
  add: (config: NotificationConfig) => string;
  // requestClose 標記為正在關閉 (觸發離場動畫)，remove 會真正從陣列移除
  requestClose: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // 標記為正在關閉；UI 應在動畫結束時呼叫 remove
  const requestClose = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isClosing: true } : n)));
  }, []);

  const add = useCallback((config: NotificationConfig): string => {
    const id = config.id || generateId();
    const notification: NotificationItem = {
      id,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message,
      duration: config.duration !== undefined ? config.duration : 0, // modal 預設不自動關閉
      actions: config.actions,
      closable: config.closable !== undefined ? config.closable : true,
      onClose: config.onClose,
      createdAt: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);

    // 自動關閉：先 requestClose 觸發離場動畫，再由 UI 在動畫結束時執行 remove
    if (notification.duration > 0) {
      setTimeout(() => {
        requestClose(id);
      }, notification.duration);
    }

    return id;
  }, [generateId, requestClose]);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, add, requestClose, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};