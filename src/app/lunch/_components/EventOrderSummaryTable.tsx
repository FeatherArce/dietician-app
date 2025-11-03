"use client";
import { formatCurrency } from '@/libs/formatter';
import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import {
    FaDollarSign,
    FaShoppingCart,
    FaUsers
} from 'react-icons/fa';
import type { EventStatistics } from '../types';
import OrderDetailTable from './OrderDetailTable';

interface EventStatisticsProps extends React.HTMLAttributes<HTMLDivElement> {
    statistics: EventStatistics;
    showStatistics?: boolean;
    className?: string;
}

export interface EventOrderSummaryTableRef {
    download: () => void;
}

// 生成統計報告文字
const generateReportText = (statistics: EventStatistics) => {
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
            report += `　${order.user?.name}：${formatCurrency(order.total)}\n`;
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
};

function EventOrderSummaryTable(
    {
        statistics,
        className = '',
        showStatistics = true,
        ...props
    }: EventStatisticsProps,
    ref: React.Ref<EventOrderSummaryTableRef>
) {
    // 下載統計報告
    const downloadReport = useCallback(() => {
        const reportText = generateReportText(statistics);
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `訂餐統計_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [statistics]);

    useImperativeHandle(ref, () => ({
        download: () => {
            downloadReport();
        }
    }), [downloadReport]);

    return (
        <div {...props}>
            {/* 統計摘要 */}
            {showStatistics && (<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="stat bg-primary/10 rounded-lg !border-r-0 shadow">
                    <div className="stat-figure text-primary">
                        <FaShoppingCart size={24} />
                    </div>
                    <div className="stat-title text-xs">訂單數量</div>
                    <div className="stat-value text-lg text-primary">{statistics.totalOrders}</div>
                    <div className="stat-desc">筆訂單</div>
                </div>
                <div className="stat bg-success/10 rounded-lg !border-r-0 shadow">
                    <div className="stat-figure text-success">
                        <FaUsers size={24} />
                    </div>
                    <div className="stat-title text-xs">參與人數</div>
                    <div className="stat-value text-lg text-success">{statistics.participantCount}</div>
                    <div className="stat-desc">位顧客</div>
                </div>
                <div className="stat bg-warning/10 rounded-lg !border-r-0 shadow">
                    <div className="stat-figure text-warning">
                        <FaDollarSign size={24} />
                    </div>
                    <div className="stat-title text-xs">總金額</div>
                    <div className="stat-value text-lg text-warning">{formatCurrency(statistics.totalAmount)}</div>
                    <div className="stat-desc">新台幣</div>
                </div>
                <div className="stat bg-info/10 rounded-lg !border-r-0 shadow">
                    <div className="stat-figure text-info">
                        <FaDollarSign size={20} />
                    </div>
                    <div className="stat-title text-xs">已收款</div>
                    <div className="stat-value text-lg text-info">
                        {statistics.orders.filter(order => (order as any).is_paid).length}
                    </div>
                    <div className="stat-desc">筆訂單</div>
                </div>
                <div className="stat bg-error/10 rounded-lg !border-r-0 shadow">
                    <div className="stat-figure text-error">
                        <FaDollarSign size={20} />
                    </div>
                    <div className="stat-title text-xs">未收款</div>
                    <div className="stat-value text-lg text-error">
                        {statistics.orders.filter(order => !(order as any).is_paid).length}
                    </div>
                    <div className="stat-desc">筆訂單</div>
                </div>
            </div>)}

            {/* 訂單明細 */}
            <OrderDetailTable statistics={statistics} />
        </div>
    );
}

export default forwardRef(EventOrderSummaryTable);