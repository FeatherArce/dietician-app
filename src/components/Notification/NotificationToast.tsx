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
import Modal, { ModalRef } from '../Modal';

interface NotificationModalProps {
  notification: NotificationItem;
  // 使用者或 backdrop 點擊時，先 requestClose 以觸發離場動畫
  onRequestClose: (id: string) => void;
  // 動畫結束後，呼叫以真正從 provider 移除通知
  onFinalizeClose: (id: string) => void;
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
  onRequestClose,
  onFinalizeClose
}) => {
  const modalRef = React.useRef<ModalRef>(null);
  const [visible, setVisible] = React.useState(false);
  const typeConfig = getTypeConfig(notification.type);
  const IconComponent = typeConfig.icon;

  const handleCloseRequest = () => {
    // 標記為正在關閉，UI 會根據 notification.isClosing 播放動畫
    onRequestClose(notification.id);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseRequest();
    }
  };

  // 當 notification 或其 isClosing 標記改變時處理進出場動畫
  React.useEffect(() => {
    // 當 mount 時，啟動 enter 動畫
    setVisible(true);
  }, [notification.id]);

  React.useEffect(() => {
    if (notification.isClosing) {
      // 觸發離場動畫
      setVisible(false);
      // 等待動畫結束再真正移除：使用一個 timeout 與 CSS transition 時間保持一致
      const timeout = setTimeout(() => {
        onFinalizeClose(notification.id);
      }, 220); // 與下方 transition-duration 相近
      return () => clearTimeout(timeout);
    }
  }, [notification.isClosing, notification.id, onFinalizeClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={handleBackdropClick}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className={`relative z-10 max-w-md w-full transition-transform duration-200 ${visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
        >
          <div className="bg-base-100 p-6 rounded-lg shadow-lg relative">
          {/* 關閉按鈕 */}
          {notification.closable && (
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleCloseRequest}
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
                      handleCloseRequest();
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
              <button className="btn btn-primary" onClick={handleCloseRequest}>
                確定
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};