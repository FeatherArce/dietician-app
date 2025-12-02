"use client";
import EventCard from '@/app/lunch/_components/EventCard';
import { ROUTE_CONSTANTS } from '@/constants/app-constants';
import { getLunchEventById } from '@/data-access/lunch/lunch-event';
import { authFetch } from '@/libs/auth-fetch';
import { LunchOrder } from '@/prisma-generated/postgres-client';
import { ILunchEvent } from '@/types/LunchEvent';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function JoinEventPage() {
    const params = useParams();
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    const user = session?.user;
    const [event, setEvent] = useState<ILunchEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasOrder, setHasOrder] = useState(false);

    const eventId = useMemo(() => {
        return params.id as string;
    }, [params.id]);

    const getEvent = useCallback(async () => {
        if (!eventId) {
            setError('無效的活動 ID');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { response, result } = await getLunchEventById(eventId);
            console.log('Fetch event by ID response:', { response, result });

            if (result.success && result?.data?.event) {
                setEvent(result.data.event);
            } else {
                setEvent(null);
                setError(result.message || '活動不存在');
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }, [eventId]);

    const hasUserOrder = useCallback((uid: string, orders: LunchOrder[]) => {
        return orders.some(order => order.user_id === uid);
    }, []);

    const getOrder = useCallback(async () => {
        if (!user?.id) {
            return;
        }
        try {
            setLoading(true);

            const orderResponse = await authFetch(`/api/lunch/orders?userId=${user.id}&eventId=${eventId}`);
            const orderData = await orderResponse.json();
            console.log('Fetch user orders for event response:', orderData);
            setHasOrder(orderData.success && orderData.orders && hasUserOrder(user.id, orderData.orders));

        } catch (err) {
            console.error('Failed to fetch event:', err);
            setError('載入活動失敗');
        } finally {
            setLoading(false);
        }
    }, [eventId, user?.id, hasUserOrder]);

    useEffect(() => {
        getEvent();
    }, [getEvent]);

    useEffect(() => {
        getOrder();
    }, [getOrder]);

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
                    <Link href={ROUTE_CONSTANTS.LUNCH} className="btn btn-primary">
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
                    <Link href={ROUTE_CONSTANTS.LUNCH} className="btn btn-primary">
                        回到訂餐首頁
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-4 max-w-2xl">
            {/* 頁面標題 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">參與訂餐活動</h1>
                <p className="text-base-content/70">
                    您收到了一個訂餐活動邀請
                </p>
            </div>

            <EventCard
                event={event}
                user={user}
            />

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

                        <div className="text-center">
                            <Link href={ROUTE_CONSTANTS.LUNCH} className="link link-primary text-sm">
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