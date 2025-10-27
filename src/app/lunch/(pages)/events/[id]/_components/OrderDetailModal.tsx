"use client";

import React from 'react';
import {
    FaTimes,
    FaUser,
    FaCalendarAlt,
    FaDollarSign,
    FaClipboardList,
    FaStickyNote
} from 'react-icons/fa';
import DataTable, { Column, SummaryConfig } from '@/components/DataTable';

interface OrderItem extends Record<string, unknown> {
    id: string;
    name: string;
    quantity: number;
    price: number;
    note?: string;
}

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        total: number;
        note?: string;
        created_at: Date;
        user: {
            id: string;
            name: string;
        };
        items: OrderItem[];
    } | null;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    if (!isOpen || !order) return null;

    // 格式化金額
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // 定義 DataTable 的欄位
    const columns: Column<OrderItem>[] = [
        {
            key: 'name',
            title: '餐點名稱',
            dataIndex: 'name',
            width: '30%',
            render: (value) => (
                <div className="font-medium">{String(value)}</div>
            )
        },
        {
            key: 'quantity',
            title: '數量',
            dataIndex: 'quantity',
            align: 'right',
            width: '15%',
        },
        {
            key: 'price',
            title: '單價',
            dataIndex: 'price',
            align: 'right',
            width: '20%',
            render: (value) => formatCurrency(Number(value))
        },
        {
            key: 'subtotal',
            title: '小計',
            align: 'right',
            width: '20%',
            render: (_, record) => (
                <span className="font-semibold text-success">
                    {formatCurrency(record.price * record.quantity)}
                </span>
            )
        },
        {
            key: 'note',
            title: '備註',
            dataIndex: 'note',
            width: '15%',
            render: (value) => {
                return value ? (
                    <div className="text-sm">
                        <span className="text-orange-600 italic">
                            🍽️ {String(value)}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                );
            }
        }
    ];

    // 定義總結欄配置
    const summaryConfig: SummaryConfig<OrderItem> = {
        show: true,
        fixed: true,
        columns: [
            {
                key: 'name',
                type: 'custom',
                render: () => <span className="font-bold">總計：</span>
            },
            {
                key: 'quantity',
                type: 'sum',
                render: (data) => {
                    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
                    return <span className="">{totalQuantity}</span>;
                }
            },
            {
                key: 'price',
                type: 'custom',
            },
            {
                key: 'subtotal',
                type: 'custom',
                render: (data) => (
                    <span className="font-bold text-success text-lg">
                        {formatCurrency(data.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                )
            },
            {
                key: 'note',
                type: 'custom',
            }
        ]
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaClipboardList className="text-primary" />
                        訂單詳細內容
                    </h3>
                    <button 
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* 訂單基本資訊 */}
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-base-content/70 flex items-center gap-1">
                                <FaUser className="w-3 h-3" />
                                訂購人
                            </label>
                            <div className="font-semibold">{order.user.name}</div>
                        </div>
                        <div>
                            <label className="text-sm text-base-content/70 flex items-center gap-1">
                                <FaDollarSign className="w-3 h-3" />
                                總金額
                            </label>
                            <div className="font-semibold text-success">
                                {formatCurrency(order.total)}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm text-base-content/70 flex items-center gap-1">
                                <FaCalendarAlt className="w-3 h-3" />
                                下單時間
                            </label>
                            <div className="font-semibold">
                                {new Date(order.created_at).toLocaleString("zh-TW")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 餐點列表 */}
                <div className="mb-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FaClipboardList className="text-info" />
                        訂購餐點
                    </h4>
                    <DataTable<OrderItem>
                        columns={columns}
                        dataSource={order.items}
                        pagination={false}
                        size="sm"
                        summary={summaryConfig}
                    />
                </div>

                {/* 訂單備註 */}
                {order.note && (
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FaStickyNote className="text-warning" />
                            訂單備註
                        </h4>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <div className="text-sm text-blue-600">
                                📝 {order.note}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="modal-action">
                    <button className="btn btn-primary" onClick={onClose}>
                        關閉
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}