"use client";
import { formatCurrency } from '@/libs/formatter';
import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import {
    FaDollarSign,
    FaShoppingCart,
    FaUser,
    FaUsers
} from 'react-icons/fa';
import OrderDetailTable from './OrderDetailTable';
import { ILunchEvent } from '@/types/LunchEvent';

interface EventStatisticsProps extends React.HTMLAttributes<HTMLDivElement> {
    event?: ILunchEvent;
    showStatistics?: boolean;
}

export interface EventOrderSummaryTableRef {
    download: () => void;
}

// 生成統計報告文字
const generateReportText = (event: ILunchEvent) => {
    const { shop, orders, _count } = event;

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
};

function EventOrderSummaryTable(
    {
        event,
        className = '',
        showStatistics = true,
    }: EventStatisticsProps,
    ref: React.Ref<EventOrderSummaryTableRef>
) {
    console.log('EventOrderSummaryTable rendered with event:', event);
    // 下載統計報告
    const downloadReport = useCallback(() => {
        if (!event) return;
        const reportText = generateReportText(event);
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `訂餐統計_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [event]);

    useImperativeHandle(ref, () => ({
        download: () => {
            downloadReport();
        }
    }), [downloadReport]);

    const renderStat = (icon: React.ReactNode, title: string, value: string | number, desc: string) => {
        return (
            <div className="stat bg-primary/10 rounded-lg !border-r-0 shadow">
                <div className="stat-figure text-primary">
                    {icon}
                </div>
                <div className="stat-title text-xs">{title}</div>
                <div className="stat-value text-lg text-primary">{value}</div>
                <div className="stat-desc">{desc}</div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${className}`}>
            {/* 統計摘要 */}
            {showStatistics && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {renderStat(<FaShoppingCart size={24} />, '訂單數量', event?._count?.orders || 0, '筆訂單')}               
                {renderStat(<FaUsers size={24} />, '參與人數', event?._count?.attendees || 0, '位顧客')}
                {renderStat(<FaDollarSign size={24} />, '總金額', formatCurrency(event?._count?.total_amount || 0), '新台幣')}
                {renderStat(<FaUser size={24} />, '已收款人數', (event?._count?.paid_orders || 0), '位顧客')}
                {renderStat(<FaUser size={24} />, '未收款人數', (event?._count?.unpaid_orders || 0), '位顧客')}
            </div>)}

            {/* 訂單明細 */}
            <OrderDetailTable event={event} />
        </div>
    );
}

export default forwardRef(EventOrderSummaryTable);