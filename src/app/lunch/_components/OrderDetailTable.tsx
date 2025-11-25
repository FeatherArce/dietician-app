"use client";
import DataTable from '@/components/DataTable';
import { formatCurrency } from '@/libs/formatter';
import React, { useCallback, useMemo, useState } from 'react';
import { FaClipboardList, FaUserFriends } from 'react-icons/fa';
import Tabs from '@/components/ui/Tabs';
import { ILunchEvent } from '@/types/LunchEvent';

enum DisplayMode {
    ByUser = 'by-user',
    ByItem = 'by-item'
}

interface OrderDetailTableProps extends React.HTMLAttributes<HTMLDivElement> {
    event?: ILunchEvent;
}

// 把點餐明細改寫成表格形式顯示，並支援依使用者或依餐點兩種模式切換
export default function OrderDetailTable({ event, ...props }: OrderDetailTableProps) {
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ByUser);

    // #region Download Report

    // 生成統計報告文字
    const generateReportText = useCallback(() => {
        if (!event) return '';
        const { shop, orders, _count, _statistics } = event;

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
        report += `　訂單數量：${_count?.orders || 0} 筆\n`;
        report += `　參與人數：${_count?.attendees || 0} 人\n`;
        report += `　總金額：${formatCurrency(_count?.total_amount || 0)}\n\n`;

        // 依使用者統計
        if ((orders || []).length > 0) {
            report += `使用者訂單：\n`;
            (orders || []).forEach(order => {
                report += `　${order.user?.name}：${formatCurrency(order.total)}\n`;
                (order.items || []).forEach(item => {
                    report += `　　- ${item.name} x${item.quantity}\n`;
                });
                if (order.note) {
                    report += `　　備註：${order.note}\n`;
                }
                report += `\n`;
            });
        }

        // TODO: 依餐點統計 

        return report;
    }, [event]);

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
        <div className='grid grid-rows-[auto_1fr] w-full min-w-0 space-y-4' {...props}>
            <Tabs
                activeTab={displayMode}
                onTabChange={(tabId) => setDisplayMode(tabId as DisplayMode)}
                items={[
                    {
                        id: DisplayMode.ByUser,
                        label: '依使用者',
                        icon: <FaUserFriends className="mr-1" />,
                        content: (<>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FaUserFriends className="text-info" />
                                使用者訂單明細
                            </h4>
                            <div className="space-y-3">
                                <div className='w-full max-w-full'>
                                    <UserOrderDetailTable event={event} />
                                </div>
                            </div>
                        </>)
                    },
                    {
                        id: DisplayMode.ByItem,
                        label: '依餐點',
                        icon: <FaClipboardList className="mr-1" />,
                        content: (<>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FaClipboardList className="text-info" />
                                餐點統計明細
                            </h4>
                            <div className="space-y-3">
                                <div className='w-full max-w-full'>
                                    <MenuOrderDetailTable event={event} />
                                </div>
                            </div>
                        </>)
                    }
                ]}
            />
        </div>
    );
}

interface OrderDetailTableSource extends Record<string, unknown> {
    is_paid: boolean;
    username: string;
    name: string;
    price: number;
    quantity: number;
    note?: string;
}

function UserOrderDetailTable({ event }: { event?: ILunchEvent }) {
    const orderDetails = useMemo(() => {
        const newDetails: Array<OrderDetailTableSource> = [];
        (event?.orders || []).forEach(order => {
            (order.items || []).forEach(item => {
                newDetails.push({
                    is_paid: (order as any).is_paid,
                    username: order.user?.name || '',
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    note: item.note || undefined,
                });
            });
        });
        return newDetails;
    }, [event]);

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

function MenuOrderDetailTable({ event }: { event?: ILunchEvent }) {
    const orderDetails = useMemo(() => {
        // 依餐點彙總訂單明細
        const detailsMap: Map<string, {
            name: string;
            price: number;
            quantity: number;
            notes: Array<string>;
            items: Array<OrderDetailTableSource>;
        }> = new Map();

        (event?.orders || []).forEach(order => {
            (order.items || []).forEach(item => {
                const key = item.name;
                const existing = detailsMap.get(key);
                if (existing) {
                    existing.quantity += item.quantity;
                    const newItems = existing.items;
                    newItems.push({
                        is_paid: (order as any).is_paid,
                        username: order.user?.name || '',
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        note: item.note || undefined
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
                        username: order.user?.name || '',
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        note: item.note || undefined
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
    }, [event]);

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