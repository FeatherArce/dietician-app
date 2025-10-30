"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { FaCalendarAlt, FaStore, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import { authFetch } from '@/libs/auth-fetch';
import { ROUTE_CONSTANTS } from '@/constants/app-constants';

interface EventWithDetails {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    order_deadline: string;
    is_active: boolean;
    owner?: {
        id: string;
        name: string;
        role: string;
    };
    shop?: {
        id: string;
        name: string;
        is_active: boolean;
    };
    orders?: Array<{ id: string; user_id: string; [key: string]: unknown }>; // 實際的訂單陣列
    attendees?: Array<{ id: string; name: string; [key: string]: unknown }>; // 實際的參與者陣列
    _count?: {
        orders: number;
        attendees: number;
    };
}

export default function JoinEventPage() {
    const params = useParams();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [event, setEvent] = useState<EventWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasOrder, setHasOrder] = useState(false);

    const eventId = params.id as string;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/lunch/events/${eventId}`);
                const data = await response.json();

                if (data.success && data.event) {
                    setEvent(data.event);
                    
                    // 如果用戶已登入，檢查是否已有訂單
                    if (user?.id) {
                        const orderResponse = await authFetch(`/api/lunch/orders?userId=${user.id}&eventId=${eventId}`);
                        const orderData = await orderResponse.json();
                        setHasOrder(orderData.success && orderData.orders && orderData.orders.length > 0);
                    }
                } else {
                    setError(data.error || '活動不存在');
                }
            } catch (err) {
                console.error('Failed to fetch event:', err);
                setError('載入活動失敗');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId, user?.id]);

    const getEventStatus = () => {
        if (!event) return null;
        
        const now = new Date();
        const orderDeadline = new Date(event.order_deadline);

        if (!event.is_active) {
            return { status: 'closed', text: '已關閉', color: 'badge-error' };
        }

        if (orderDeadline < now) {
            return { status: 'ended', text: '訂餐結束', color: 'badge-warning' };
        }

        return { status: 'active', text: '進行中', color: 'badge-success' };
    };

    const canOrder = () => {
        if (!event) return false;
        const status = getEventStatus();
        return status?.status === 'active';
    };

    if (isLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">載入失敗</h2>
                    <p className="mb-4">{error}</p>
                    <Link href="/lunch" className="btn btn-primary">
                        回到訂餐首頁
                    </Link>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">活動不存在</h2>
                    <p className="mb-4">您要查看的訂餐活動不存在或已被刪除</p>
                    <Link href="/lunch" className="btn btn-primary">
                        回到訂餐首頁
                    </Link>
                </div>
            </div>
        );
    }

    const eventStatus = getEventStatus();

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* 頁面標題 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">參與訂餐活動</h1>
                <p className="text-base-content/70">
                    您收到了一個訂餐活動邀請
                </p>
            </div>

            {/* 活動詳情卡片 */}
            <div className="card bg-base-100 shadow-lg border border-base-200 mb-6">
                <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="card-title text-xl">{event.title}</h2>
                        <span className={`badge ${eventStatus?.color} badge-sm`}>
                            {eventStatus?.text}
                        </span>
                    </div>

                    {event.description && (
                        <p className="text-base-content/70 mb-4">
                            {event.description}
                        </p>
                    )}

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-primary" />
                            <span>活動日期：{new Date(event.event_date).toLocaleDateString("zh-TW")}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-warning">⏰</span>
                            <span>訂餐截止：{new Date(event.order_deadline).toLocaleString("zh-TW")}</span>
                        </div>

                        {event.shop && (
                            <div className="flex items-center space-x-2">
                                <FaStore className="w-4 h-4 text-secondary" />
                                <span>商店：{event.shop.name}</span>
                            </div>
                        )}

                        {event.owner && (
                            <div className="flex items-center space-x-2">
                                <span>👤</span>
                                <span>主辦人：{event.owner.name}</span>
                            </div>
                        )}

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <FaUsers className="w-4 h-4 text-secondary" />
                                <span>{event._count?.attendees || event.attendees?.length || 0} 人參與</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span>📋</span>
                                <span>{event._count?.orders || event.orders?.length || 0} 筆訂單</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 操作區域 */}
            <div className="space-y-4">
                {!isAuthenticated ? (
                    <div className="alert alert-info">
                        <span>請先登入以參與此訂餐活動</span>
                        <div className="flex space-x-2">
                            <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary btn-sm">
                                登入
                            </Link>
                            <Link href={ROUTE_CONSTANTS.REGISTER} className="btn btn-ghost btn-sm">
                                註冊
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {hasOrder && (
                            <div className="alert alert-success">
                                <span>✅ 您已經在這個活動中訂餐了！</span>
                            </div>
                        )}

                        <div className="flex justify-center space-x-3">
                            <Link
                                href={`/lunch/events/${event.id}`}
                                className="btn btn-ghost"
                            >
                                查看詳情
                            </Link>

                            {canOrder() && (
                                <Link
                                    href={`/lunch/events/${event.id}/order`}
                                    className="btn btn-primary"
                                >
                                    {hasOrder ? '修改訂單' : '開始訂餐'}
                                </Link>
                            )}

                            {!canOrder() && eventStatus?.status === 'ended' && (
                                <button className="btn btn-disabled">
                                    訂餐已結束
                                </button>
                            )}

                            {!canOrder() && eventStatus?.status === 'closed' && (
                                <button className="btn btn-disabled">
                                    活動已關閉
                                </button>
                            )}
                        </div>

                        <div className="text-center">
                            <Link href="/lunch" className="link link-primary text-sm">
                                回到我的訂餐首頁
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* 活動說明 */}
            <div className="mt-8 text-center text-sm text-base-content/50">
                <p>透過分享連結，您可以輕鬆參與朋友們的訂餐活動</p>
            </div>
        </div>
    );
}