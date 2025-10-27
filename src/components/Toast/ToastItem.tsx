"use client";

import React from 'react';
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaTimes
} from 'react-icons/fa';
import { ToastItem as ToastItemType, ToastType } from './types';

interface ToastComponentProps {
    toast: ToastItemType;
    onClose: (id: string) => void;
}

const getTypeConfig = (type: ToastType) => {
    const configs = {
        success: {
            icon: FaCheckCircle,
            alertClass: 'alert-success',
            iconColor: 'text-success'
        },
        error: {
            icon: FaExclamationCircle,
            alertClass: 'alert-error',
            iconColor: 'text-error'
        },
        warning: {
            icon: FaExclamationTriangle,
            alertClass: 'alert-warning',
            iconColor: 'text-warning'
        },
        info: {
            icon: FaInfoCircle,
            alertClass: 'alert-info',
            iconColor: 'text-info'
        }
    };
    return configs[type];
};

export const ToastItem: React.FC<ToastComponentProps> = ({ toast, onClose }) => {
    const typeConfig = getTypeConfig(toast.type);
    const IconComponent = typeConfig.icon;

    const handleClose = () => {
        onClose(toast.id);
    };

    return (
        <div className={`alert ${typeConfig.alertClass} shadow-lg mb-3 animate-slide-in flex`}>
            <div className="flex-1">
                <div className="flex items-center space-x-3">
                    {IconComponent ? <IconComponent className={`w-5 h-5 ${typeConfig.iconColor} flex-shrink-0`} /> : null}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm">
                            {typeof toast.message === 'string' ? (
                                <span>{toast.message}</span>
                            ) : (
                                toast.message
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-none">
                <button
                    className="btn btn-square btn-ghost btn-xs"
                    onClick={handleClose}
                >
                    <FaTimes className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};