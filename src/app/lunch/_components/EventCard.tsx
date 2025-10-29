"use client";

import React from 'react';
import Link from 'next/link';
import { LunchEvent, UserRole } from '@/prisma-generated/postgres-client';
import {
    FaCalendarAlt,
    FaUsers,
    FaClock,
    FaStore,
    FaUser,
    FaUserFriends,
    FaClipboardList,
    FaShare,
    FaExternalLinkAlt,
    FaChartBar,
    FaInfo,
    FaEdit
} from 'react-icons/fa';
import type { EventWithDetails, MyOrder, User } from '../types';
import LoadingIndicator from '@/components/LoadingIndicator';

interface EventCardProps {
    event: EventWithDetails;
    user: User | null;
    getUserOrderForEvent: (eventId: string) => MyOrder | null;
    onShowOrderDetail: (order: MyOrder) => void;
    onShowEventStats?: (eventId: string) => void; // 新增統計按鈕回調
}

const getEventStatusBadge = (event: LunchEvent) => {
    const now = new Date();
    const orderDeadline = new Date(event.order_deadline);

    if (!event.is_active) {
        return <span className="badge badge-error badge-sm">已關閉</span>;
    }

    if (orderDeadline < now) {
        return <span className="badge badge-warning badge-sm">訂餐結束</span>;
    }

    return <span className="badge badge-success badge-sm">進行中</span>;
};

export default function EventCard({
    event,
    user,
    getUserOrderForEvent,
    onShowOrderDetail,
    onShowEventStats
}: EventCardProps) {
    // 檢查用戶是否為活動建立者
    const isOwner = event.owner_id === user?.id;
    const hasManagePermission = isOwner || user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

    // 檢查用戶是否有此活動的訂單
    const userOrder = getUserOrderForEvent(event.id);
    const hasOrder = !!userOrder;

    return (
        <div key={event.id} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 grid grid-rows-[auto_auto_1fr_auto] gap-4">
                <div className="flex justify-between items-start">
                    <h3 className="card-title text-lg">{event.title}</h3>
                    <div className="flex items-center gap-2">
                        {/* 管理功能按鈕 - 只有管理者能看到 */}
                        {hasManagePermission && (
                            <>
                                <Link
                                    href={`/lunch/events/${event.id}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <FaEdit className="w-3 h-3" />
                                    編輯
                                    <LoadingIndicator />
                                </Link>
                                {/* <Link
                                href={`/lunch/events/${event.id}/edit`}
                                className="btn btn-warning btn-sm"
                            >
                                編輯
                            </Link> */}
                            </>
                        )}

                        <button
                            onClick={() => {
                                const shareUrl = `${window.location.origin}/lunch/events/${event.id}/join`;
                                navigator.clipboard.writeText(shareUrl);
                                // 可以加入 toast 通知
                                alert('分享連結已複製到剪貼簿！');
                            }}
                            className="btn btn-ghost btn-sm"
                        >
                            <FaShare className="w-3 h-3" />
                            分享
                        </button>

                    </div>
                </div>

                <div>
                    {event.description && (
                        <p className="text-sm text-base-content/70 line-clamp-2">
                            {event.description}
                        </p>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="w-3 h-3 text-primary" />
                        <span>活動日期：{new Date(event.event_date).toLocaleDateString("zh-TW")}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <FaClock className="w-3 h-3 text-warning" />
                        <span>訂餐截止：{new Date(event.order_deadline).toLocaleString("zh-TW")}</span>
                    </div>

                    {event.shop && (
                        <div className="flex items-center space-x-2">
                            <FaStore className="w-3 h-3 text-info" />
                            <span>商店：{event.shop.name}</span>
                        </div>
                    )}

                    {event.owner && (
                        <div className="flex items-center space-x-2">
                            <FaUser className="w-3 h-3 text-accent" />
                            <span>主辦人：{event.owner.name}</span>
                        </div>
                    )}

                    {/* 顯示用戶角色 */}
                    {/* <div className="flex items-center space-x-2">
                        <FaUserFriends className="w-3 h-3 text-secondary" />
                        <span>我的角色：{isOwner ? '主辦人' : '參與者'}</span>
                    </div> */}

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FaUsers className="w-3 h-3 text-secondary" />
                            <span>{event._count?.attendees || event.attendees?.length || 0} 人參與</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaClipboardList className="w-3 h-3 text-primary" />
                            <span>{event._count?.orders || event.orders?.length || 0} 筆訂單</span>
                        </div>
                    </div>

                    {/* 用戶訂單摘要 */}
                    {hasOrder && userOrder && (
                        <div className="mt-3 p-3 bg-base-200 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-sm font-medium">我的訂單</span>
                                    <div className="text-xs text-base-content/70">
                                        {userOrder.items.length} 項餐點，總計 ${userOrder.total}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onShowOrderDetail(userOrder)}
                                    className="btn btn-ghost btn-xs"
                                >
                                    查看詳情
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-actions justify-end">
                    {/* 訂餐相關按鈕 - 根據狀態顯示 */}
                    {(event.is_active && new Date(event.order_deadline) > new Date()) ? (
                        !hasOrder ? (
                            <Link
                                href={`/lunch/events/${event.id}/order`}
                                className="btn btn-primary btn-sm"
                            >
                                參與訂餐
                                <LoadingIndicator />
                            </Link>
                        ) : (
                            <Link
                                href={`/lunch/events/${event.id}/order`}
                                className="btn btn-primary btn-sm"
                            >
                                修改訂單
                                <LoadingIndicator />
                            </Link>
                        )
                    ) : null}

                    {/* 統計按鈕 - 當有訂單資料時顯示 */}
                    {(event._count?.orders || event.orders?.length || 0) > 0 && onShowEventStats && (
                        <button
                            onClick={() => onShowEventStats(event.id)}
                            className="btn btn-ghost btn-sm"
                        >
                            <FaChartBar className="w-3 h-3" />
                            訂單統計
                            <LoadingIndicator />
                        </button>
                    )}

                    {/* 通用按鈕 - 所有人都能看到 */}
                </div>
            </div>
        </div>
    );
}