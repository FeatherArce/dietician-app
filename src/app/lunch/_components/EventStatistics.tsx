"use client";

import React, { useState } from 'react';
import {
    FaStore,
    FaPhone,
    FaMapMarkerAlt,
    FaDollarSign,
    FaUsers,
    FaShoppingCart,
    FaClipboardList,
    FaUserFriends,
    FaToggleOn,
    FaToggleOff,
    FaDownload,
    FaCopy
} from 'react-icons/fa';
import type { EventStatistics } from '../types';
import OrderDetailTable from './OrderDetailTable';

interface EventStatisticsProps {
    statistics: EventStatistics;
    className?: string;
}

export default function EventStatistics({ statistics, className = '' }: EventStatisticsProps) {    
    const [showContactInfo, setShowContactInfo] = useState(true);

    // 格式化金額
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // 複製聯絡資訊到剪貼簿
    const copyContactInfo = async () => {
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
    };

    // 生成統計報告文字
    const generateReportText = () => {
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
    };

    // 下載統計報告
    const downloadReport = () => {
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
    };

    return (
        <div className={`card bg-base-100 shadow-lg ${className}`}>
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg flex items-center gap-2">
                        <FaClipboardList className="text-primary" />
                        訂餐統計
                    </h3>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={downloadReport}
                            title="下載統計報告"
                        >
                            <FaDownload />
                        </button>
                        {statistics.shop && (
                            <button
                                className="btn btn-sm btn-outline btn-secondary"
                                onClick={copyContactInfo}
                                title="複製聯絡資訊"
                            >
                                <FaCopy />
                            </button>
                        )}
                    </div>
                </div>

                {/* 店家聯絡資訊 */}
                {statistics.shop && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <FaStore className="text-accent" />
                                店家聯絡資訊
                            </h4>
                            <button
                                className="btn btn-xs btn-ghost"
                                onClick={() => setShowContactInfo(!showContactInfo)}
                            >
                                {showContactInfo ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>
                        {showContactInfo && (
                            <div className="bg-base-200 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <FaStore className="text-accent flex-shrink-0" />
                                        <span className="font-medium">店名：</span>
                                        <span>{statistics.shop.name}</span>
                                    </div>
                                    {statistics.shop.phone && (
                                        <div className="flex items-center gap-2">
                                            <FaPhone className="text-success flex-shrink-0" />
                                            <span className="font-medium">電話：</span>
                                            <a
                                                href={`tel:${statistics.shop.phone}`}
                                                className="link link-success"
                                            >
                                                {statistics.shop.phone}
                                            </a>
                                        </div>
                                    )}
                                    {statistics.shop.address && (
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <FaMapMarkerAlt className="text-warning flex-shrink-0" />
                                            <span className="font-medium">地址：</span>
                                            <span>{statistics.shop.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 統計摘要 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="stat bg-primary/10 rounded-lg">
                        <div className="stat-figure text-primary">
                            <FaShoppingCart size={24} />
                        </div>
                        <div className="stat-title text-xs">訂單數量</div>
                        <div className="stat-value text-lg text-primary">{statistics.totalOrders}</div>
                        <div className="stat-desc">筆訂單</div>
                    </div>
                    <div className="stat bg-success/10 rounded-lg">
                        <div className="stat-figure text-success">
                            <FaUsers size={24} />
                        </div>
                        <div className="stat-title text-xs">參與人數</div>
                        <div className="stat-value text-lg text-success">{statistics.participantCount}</div>
                        <div className="stat-desc">位顧客</div>
                    </div>
                    <div className="stat bg-warning/10 rounded-lg">
                        <div className="stat-figure text-warning">
                            <FaDollarSign size={24} />
                        </div>
                        <div className="stat-title text-xs">總金額</div>
                        <div className="stat-value text-lg text-warning">{formatCurrency(statistics.totalAmount)}</div>
                        <div className="stat-desc">新台幣</div>
                    </div>
                    <div className="stat bg-info/10 rounded-lg">
                        <div className="stat-figure text-info">
                            <FaDollarSign size={20} />
                        </div>
                        <div className="stat-title text-xs">已收款</div>
                        <div className="stat-value text-lg text-info">
                            {statistics.orders.filter(order => (order as any).is_paid).length}
                        </div>
                        <div className="stat-desc">筆訂單</div>
                    </div>
                    <div className="stat bg-error/10 rounded-lg">
                        <div className="stat-figure text-error">
                            <FaDollarSign size={20} />
                        </div>
                        <div className="stat-title text-xs">未收款</div>
                        <div className="stat-value text-lg text-error">
                            {statistics.orders.filter(order => !(order as any).is_paid).length}
                        </div>
                        <div className="stat-desc">筆訂單</div>
                    </div>
                </div>

                {/* 訂單明細 */}
                <OrderDetailTable statistics={statistics} />
            </div>
        </div>
    );
}