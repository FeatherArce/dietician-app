"use client";

import React from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import { NotificationItem, NotificationType } from './types';

interface NotificationModalProps {
  notification: NotificationItem;
  onClose: (id: string) => void;
}

const getTypeConfig = (type: NotificationType) => {
  const configs = {
    success: {
      icon: FaCheckCircle,
      iconColor: 'text-success',
      titleColor: 'text-success'
    },
    error: {
      icon: FaExclamationCircle,
      iconColor: 'text-error',
      titleColor: 'text-error'
    },
    warning: {
      icon: FaExclamationTriangle,
      iconColor: 'text-warning',
      titleColor: 'text-warning'
    },
    info: {
      icon: FaInfoCircle,
      iconColor: 'text-info',
      titleColor: 'text-info'
    }
  };
  return configs[type];
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose
}) => {
  const typeConfig = getTypeConfig(notification.type);
  const IconComponent = typeConfig.icon;

  const handleClose = () => {
    onClose(notification.id);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal modal-open" onClick={handleBackdropClick}>
      <div className="modal-box relative max-w-md">
        {/* 關閉按鈕 */}
        {notification.closable && (
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleClose}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        {/* 圖示和標題 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0 mt-1">
            <IconComponent className={`w-6 h-6 ${typeConfig.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h3 className={`font-bold text-lg mb-2 ${typeConfig.titleColor}`}>
                {notification.title}
              </h3>
            )}
            <div className="text-base-content">
              {typeof notification.message === 'string' ? (
                <p>{notification.message}</p>
              ) : (
                notification.message
              )}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="modal-action">
            <div className="flex space-x-2 w-full justify-end">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className={`btn ${action.className || 'btn-primary'}`}
                  onClick={() => {
                    action.onClick();
                    handleClose();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 如果沒有操作按鈕，顯示預設的確定按鈕 */}
        {(!notification.actions || notification.actions.length === 0) && (
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleClose}>
              確定
            </button>
          </div>
        )}
      </div>
    </div>
  );
};