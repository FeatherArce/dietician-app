"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationConfig, NotificationItem } from './types';

interface NotificationContextType {
  notifications: NotificationItem[];
  add: (config: NotificationConfig) => string;
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

    // 自動關閉
    if (notification.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, notification.duration);
    }

    return id;
  }, [generateId, remove]);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, add, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};