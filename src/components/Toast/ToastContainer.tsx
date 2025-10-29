"use client";
import React from 'react';
import { useToast } from './ToastProvider';
import { ToastItem } from './ToastItem';
import { useToastAPI } from '.';

const getPositionClasses = (position: string) => {
  const classes = {
    'top-right': 'toast-top toast-end',
    'top-left': 'toast-top toast-start',
    'bottom-right': 'toast-bottom toast-end',
    'bottom-left': 'toast-bottom toast-start',
    'top-center': 'toast-top toast-center',
    'bottom-center': 'toast-bottom toast-center'
  };
  return classes[position as keyof typeof classes] || classes['top-right'];
};

export const ToastContainer: React.FC = () => {
  useToastAPI();
  const { toasts, remove } = useToast();

  // 按位置分組 toast
  const groupedToasts = toasts.reduce((groups, toast) => {
    const position = toast.position;
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(toast);
    return groups;
  }, {} as Record<string, typeof toasts>);

  return (
    <>
      {Object.entries(groupedToasts).map(([position, toastList]) => (
        <div
          key={position}
          className={`toast ${getPositionClasses(position)} z-40`}
        >
          {toastList.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={remove}
            />
          ))}
        </div>
      ))}
    </>
  );
};