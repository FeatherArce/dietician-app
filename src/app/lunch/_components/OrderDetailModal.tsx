"use client";

import React from 'react';
import Link from 'next/link';
import type { MyOrder } from '../types';

interface OrderDetailModalProps {
    selectedOrder: MyOrder | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    selectedOrder,
    isOpen,
    onClose
}) => {
    if (!selectedOrder) return null;

    return (
        <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">訂單詳情</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 活動資訊 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">活動資訊</h4>
                        <p className="text-sm text-base-content/70">
                            <span className="font-medium">活動名稱：</span>
                            {selectedOrder.event.title}
                        </p>
                        <p className="text-sm text-base-content/70">
                            <span className="font-medium">截止時間：</span>
                            {new Date(selectedOrder.event.order_deadline).toLocaleString('zh-TW')}
                        </p>
                        <p className="text-sm text-base-content/70">
                            <span className="font-medium">用餐日期：</span>
                            {new Date(selectedOrder.event.event_date).toLocaleString('zh-TW')}
                        </p>
                        
                        {/* 訂單狀態提示 */}
                        <div className="mt-2">
                            {new Date(selectedOrder.event.order_deadline) > new Date() ? (
                                <span className="badge badge-success badge-sm">
                                    🟢 可編輯
                                </span>
                            ) : (
                                <span className="badge badge-neutral badge-sm">
                                    🔒 已截止
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 訂購項目 */}
                    <div>
                        <h4 className="font-medium mb-2">訂購項目</h4>
                        <div className="space-y-2">
                            {selectedOrder.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-base-200 p-2 rounded">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-base-content/70">類型：{item.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">數量：{item.quantity}</p>
                                        <p className="font-medium">NT$ {item.price}</p>
                                    </div>
                                </div>
                            )) || <p className="text-base-content/70">無訂購項目</p>}
                        </div>
                    </div>

                    {/* 總金額 */}
                    <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="flex justify-between items-center font-semibold text-lg">
                            <span>總金額</span>
                            <span className="text-primary">NT$ {selectedOrder.total}</span>
                        </div>
                    </div>

                    {/* 訂單備註 */}
                    {selectedOrder.note && (
                        <div>
                            <h4 className="font-medium mb-2">訂單備註</h4>
                            <p className="text-sm bg-base-200 p-3 rounded">
                                {selectedOrder.note}
                            </p>
                        </div>
                    )}

                    {/* 訂購時間 */}
                    <div className="text-xs text-base-content/50">
                        訂購時間：{new Date(selectedOrder.created_at).toLocaleString('zh-TW')}
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-base-200">
                        {/* 檢查是否還可以編輯訂單 (截止時間未到) */}
                        {new Date(selectedOrder.event.order_deadline) > new Date() && (
                            <Link
                                href={`/lunch/events/${selectedOrder.event.id}/order`}
                                className="btn btn-primary btn-sm"
                                onClick={onClose}
                            >
                                編輯訂單
                            </Link>
                        )}
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            關閉
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Modal backdrop - 點擊背景關閉 */}
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

export default OrderDetailModal;