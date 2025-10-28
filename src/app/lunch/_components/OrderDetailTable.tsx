'use client';
import DataTable from '@/components/DataTable';
import { formatCurrency } from '@/libs/formatter';
import React, { useCallback, useMemo, useState } from 'react'
import { FaClipboardList, FaUserFriends } from 'react-icons/fa';
import { EventStatistics } from '../types';

enum DisplayMode {
    ByUser = 'by-user',
    ByItem = 'by-item'
}

interface OrderDetailTableProps {
    statistics: EventStatistics;
    className?: string;
}

// 把點餐明細改寫成表格形式顯示，並支援依使用者或依餐點兩種模式切換
export default function OrderDetailTable({ statistics }: OrderDetailTableProps) {
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ByUser);


    // 複製聯絡資訊到剪貼簿
    const copyContactInfo = useCallback(async () => {
        if (!statistics.shop) return;

        const contactText = `
店家：${statistics.shop.name}
電話：${statistics.shop.phone || '未提供'}
地址：${statistics.shop.address || '未提供'}
        `.trim();

        try {
            await navigator.clipboard.writeText(contactText);
            // 可以加入成功提示
        } catch (err) {
            console.error('複製失敗:', err);
        }
    }, [statistics.shop]);

    // #region Download Report

    // 生成統計報告文字
    const generateReportText = useCallback(() => {
        const { shop, totalOrders, totalAmount, participantCount, orders, itemSummary } = statistics;

        let report = `【訂餐統計報告】\n\n`;

        // 店家資訊 (只有在有店家資訊時才顯示)
        if (shop) {
            report += `店家資訊：\n`;
            report += `　店名：${shop.name}\n`;
            if (shop.phone) report += `　電話：${shop.phone}\n`;
            if (shop.address) report += `　地址：${shop.address}\n`;
            report += `\n`;
        }

        // 統計摘要
        report += `統計摘要：\n`;
        report += `　訂單數量：${totalOrders} 筆\n`;
        report += `　參與人數：${participantCount} 人\n`;
        report += `　總金額：${formatCurrency(totalAmount)}\n\n`;

        // 依餐點統計
        if (itemSummary.length > 0) {
            report += `餐點統計：\n`;
            itemSummary.forEach(item => {
                report += `　${item.name}：${item.quantity} 份，${formatCurrency(item.totalPrice)}\n`;

                // 如果有詳細訂單資訊，顯示每個訂購者和備註
                if (item.orderDetails && item.orderDetails.length > 0) {
                    item.orderDetails.forEach(detail => {
                        report += `　　- ${detail.userName}：${detail.quantity} 份`;
                        const notes = [];
                        if (detail.itemNote) notes.push(`餐點備註：${detail.itemNote}`);
                        if (detail.orderNote) notes.push(`訂單備註：${detail.orderNote}`);
                        if (notes.length > 0) {
                            report += ` (${notes.join(', ')})`;
                        }
                        report += `\n`;
                    });
                }
            });
            report += `\n`;
        }

        // 依使用者統計
        if (orders.length > 0) {
            report += `使用者訂單：\n`;
            orders.forEach(order => {
                report += `　${order.user.name}：${formatCurrency(order.total)}\n`;
                order.items.forEach(item => {
                    report += `　　- ${item.name} x${item.quantity}\n`;
                });
                if (order.note) {
                    report += `　　備註：${order.note}\n`;
                }
                report += `\n`;
            });
        }

        return report;
    }, [statistics]);

    // 下載統計報告
    const downloadReport = useCallback(() => {
        const reportText = generateReportText();
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `訂餐統計_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [generateReportText]);

    // #endregion

    return (
        <div className='grid grid-rows-[auto_1fr]'>
            {/* 明細顯示模式切換 */}
            <div className="flex justify-center mb-4">
                <div className="join">
                    <button
                        className={`join-item btn btn-sm ${displayMode === DisplayMode.ByUser ? 'btn-active' : 'btn-outline'}`}
                        onClick={() => setDisplayMode(DisplayMode.ByUser)}
                    >
                        <FaUserFriends className="mr-1" />
                        依使用者
                    </button>
                    <button
                        className={`join-item btn btn-sm ${displayMode === DisplayMode.ByItem ? 'btn-active' : 'btn-outline'}`}
                        onClick={() => setDisplayMode(DisplayMode.ByItem)}
                    >
                        <FaClipboardList className="mr-1" />
                        依餐點
                    </button>
                </div>
            </div>

            {/* 詳細明細 */}
            <div className="space-y-4">
                {displayMode === 'by-user' ? (
                    // 依使用者顯示
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <FaUserFriends className="text-info" />
                            使用者訂單明細
                        </h4>
                        <div className="space-y-3">
                            <UserOrderDetailTable statistics={statistics} />
                        </div>
                    </div>
                ) : (
                    // 依餐點顯示
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <FaClipboardList className="text-info" />
                            餐點統計明細
                        </h4>
                        <div className="space-y-3">
                            <MenuOrderDetailTable statistics={statistics} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

interface OrderDetailTableSource extends Record<string, unknown> {
    is_paid: boolean;
    username: string;
    name: string;
    price: number;
    quantity: number;
    note?: string;
}

function UserOrderDetailTable({ statistics }: { statistics: EventStatistics }) {
    const orderDetails = useMemo(() => {
        const newDetails: Array<OrderDetailTableSource> = [];
        (statistics.orders || []).forEach(order => {
            (order.items || []).forEach(item => {
                newDetails.push({
                    is_paid: (order as any).is_paid,
                    username: order.user?.name,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    note: item.note
                });
            });
        });
        return newDetails;
    }, [statistics]);

    return (
        <DataTable<OrderDetailTableSource>
            dataSource={orderDetails}
            columns={[
                {
                    key: 'is_paid',
                    dataIndex: 'is_paid',
                    title: '收款狀態',
                    render: (value) => value ? '已收款' : '未收款'
                },
                {
                    key: 'username',
                    dataIndex: 'username',
                    title: '使用者名稱',
                },
                {
                    key: 'mealName',
                    dataIndex: 'name',
                    title: '餐點名稱',
                },
                {
                    key: 'price',
                    dataIndex: 'price',
                    title: '單價',
                },
                {
                    key: 'quantity',
                    dataIndex: 'quantity',
                    title: '數量',
                },
                {
                    key: 'totalPrice',
                    dataIndex: 'totalPrice',
                    title: '總價',
                    render: (value, record) => {
                        return formatCurrency(record.quantity * record.price);
                    }
                },
                {
                    key: 'note',
                    dataIndex: 'note',
                    title: '備註',
                }
            ]}
        />
    );
}

function MenuOrderDetailTable({ statistics }: { statistics: EventStatistics }) {
    const orderDetails = useMemo(() => {
        // 依餐點彙總訂單明細
        const detailsMap: Map<string, {
            name: string;
            price: number;
            quantity: number;
            notes: Array<string>;
            items: Array<OrderDetailTableSource>;
        }> = new Map();

        (statistics.orders || []).forEach(order => {
            (order.items || []).forEach(item => {
                const key = item.name;
                const existing = detailsMap.get(key);
                if (existing) {
                    existing.quantity += item.quantity;
                    const newItems = existing.items;
                    newItems.push({
                        is_paid: (order as any).is_paid,
                        username: order.user?.name,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        note: item.note
                    });
                    existing.items = newItems;
                    const newNotes = existing.notes;
                    if (item.note) {
                        newNotes?.push(item.note);
                    }
                    existing.notes = newNotes;
                } else {
                    const newNotes = [];
                    if (item.note) {
                        newNotes.push(item.note);
                    }
                    const newItems = [];
                    newItems.push({
                        is_paid: (order as any).is_paid,
                        username: order.user?.name,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        note: item.note
                    });
                    detailsMap.set(key, {
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        notes: newNotes,
                        items: newItems
                    });
                }
            });
        });

        return Array.from(detailsMap.values());
    }, [statistics]);

    return (
        <DataTable
            dataSource={orderDetails}
            columns={[
                {
                    key: 'mealName',
                    dataIndex: 'name',
                    title: '餐點名稱',
                },
                {
                    key: 'price',
                    dataIndex: 'price',
                    title: '單價',
                },
                {
                    key: 'quantity',
                    dataIndex: 'quantity',
                    title: '數量',
                },
                {
                    key: 'totalPrice',
                    dataIndex: 'totalPrice',
                    title: '總價',
                    render: (value, record: { quantity: number; price: number }) => {
                        return formatCurrency(record.quantity * record.price);
                    }
                },
                {
                    key: 'notes',
                    dataIndex: 'notes',
                    title: '備註',
                    render: (value, record) => {
                        return (
                            <ul>
                                {(value as string[] || []).map((note, index) => (
                                    <li key={index}>{note}</li>
                                ))}
                            </ul>
                        );
                    }
                }
            ]}
        />
    );
}