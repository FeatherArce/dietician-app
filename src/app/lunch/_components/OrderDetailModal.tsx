"use client";
import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import { formatCurrency } from '@/libs/formatter';
import { ILunchOrderItem, MyOrder } from '@/types/LunchEvent';

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
                <div className='grid space-y-2 mb-4'>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{selectedOrder.event.title} 訂單詳情</h3>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 訂單狀態提示 */}
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

                <div className="space-y-4">
                    {/* 訂購項目 */}
                    <OrderTable order={selectedOrder} />

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
                    <div className="text-xs text-base-content/70">
                        訂購時間：{new Date(selectedOrder.created_at).toLocaleString('zh-TW')}
                    </div>
                    <div className='text-xs text-base-content/70'>
                        截止時間：{new Date(selectedOrder.event.order_deadline).toLocaleString('zh-TW')}
                    </div>


                    {/* 操作按鈕 */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-base-200">
                        {/* 檢查是否還可以編輯訂單 (截止時間未到) */}
                        {new Date(selectedOrder.event.order_deadline) > new Date() && (
                            <Link
                                href={`/lunch/events/${selectedOrder.event.id}/order`}
                                className="btn btn-link btn-sm"
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

function OrderTable({ order }: { order: MyOrder }) {
    return (
        <DataTable<ILunchOrderItem>
            dataSource={order.items}
            pagination={false}
            columns={[
                {
                    title: '名稱',
                    key: 'name',
                },
                {
                    title: '單價',
                    align: 'right',
                    key: 'price',
                },
                {
                    title: '數量',
                    align: 'right',
                    key: 'quantity',
                },
                {
                    title: '小計',
                    key: 'subtotal',
                    align: 'right',
                    render: (_, item) => formatCurrency(item.price * item.quantity),
                },
                {
                    title: '備註',
                    key: 'note',
                },
            ]}
            summary={{
                show: true,
                columns: [
                    {
                        key: 'name',
                        render: () => <span className="font-semibold">總計</span>,
                    },
                    {
                        key: 'quantity',
                        type: 'sum',

                    },
                    {
                        key: 'subtotal',
                        render: (data, allData) => {
                            const total = allData.reduce((sum, item) => sum + item.price * item.quantity, 0);
                            return formatCurrency(total);
                        }
                    },
                ]
            }}
        />
    );
}