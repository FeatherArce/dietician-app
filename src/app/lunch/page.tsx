"use client";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PageContainer from '@/components/page/PageContainer';
import SearchContainer from '@/components/SearchContainer';
import { Select } from '@/components/SearchContainer/SearchFields';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FaCalendarAlt,
    FaPlus,
    FaSpinner
} from 'react-icons/fa';
import EventCard from './_components/EventCard';
import EventStatistics from './_components/EventStatistics';
import OrderDetailModal from './_components/OrderDetailModal';
import type { EventStatistics as EventStatisticsType, EventWithDetails, MyOrder } from './types';
import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from '@/constants/app-constants';
import { authFetch } from '@/libs/auth-fetch';

enum EventActiveType {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

/**
 * 訂餐頁面
 * 使用流程：
 * 1. 揪團人開啟訂餐事件，需選擇商店、訂餐截止時間；沒有商店則需要新增，商店沒有菜單可以讓使用者自己填寫餐點資訊
 * 2. 預設進入畫面可以看到進行中的訂餐事件，並參與訂餐，需填寫餐點資訊 (系統會另外紀錄訂餐人資訊與IP)
 * 3. 訂餐人可以看到自己的訂單資訊，並可以修改 (by IP or 登入)
 * 4. 揪團人可以看到所有訂單資訊，並可以新增、刪除或修改訂單與餐點資訊 (by IP or 登入)
 * 5. 訂餐截止後，事件會變成結束，可以到歷史頁面看到所有訂餐事件，點進去後可以看到所有訂單資訊
 * 
 * @returns Lunch Page
 */
export default function LunchPage() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [myEvents, setMyEvents] = useState<EventWithDetails[]>([]);
    const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActiveType, setSelectedActiveType] = useState<string>(EventActiveType.ACTIVE); // 活動類型篩選
    const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // 個別事件統計相關狀態
    const [eventStats, setEventStats] = useState<EventStatisticsType | null>(null);
    const [showEventStats, setShowEventStats] = useState(false);
    const [loadingEventStats, setLoadingEventStats] = useState(false);

    const filteredEvents = useMemo(() => {
        return (myEvents || []).filter(event => {
            if (selectedActiveType === EventActiveType.ACTIVE && !event.is_active) {
                return false;
            }
            if (selectedActiveType === EventActiveType.INACTIVE && event.is_active) {
                return false;
            }
            return true;
        });
    }, [myEvents, selectedActiveType]);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            // 獲取用戶已參與的活動（包含建立的和有訂單的）
            // const url = `/api/lunch/events/participated?userId=${user?.id}`;
            const url = `/api/lunch/events`;
            const response = await authFetch(url);
            const data = await response.json();

            if (data.success && data.events) {
                const events = data.events as EventWithDetails[];
                setMyEvents(events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMyOrders = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await authFetch(`/api/lunch/orders?userId=${user.id}`);
            const data = await response.json();

            if (data.success && data.orders) {
                setMyOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    }, [user?.id]);

    // 獲取個別事件統計資料
    const fetchEventStats = useCallback(async (eventId: string) => {
        if (!user?.id) return;

        setLoadingEventStats(true);
        try {
            const response = await authFetch(`/api/lunch/events/${eventId}?include=details`);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.event) {
                    // 轉換事件資料為統計格式 (複用事件詳細頁面的邏輯)
                    const event = data.event;
                    const itemMap = new Map();
                    const participantSet = new Set();

                    for (const order of event.orders || []) {
                        participantSet.add(order.user.id);

                        for (const item of order.items || []) {
                            const key = item.name;
                            if (itemMap.has(key)) {
                                const existing = itemMap.get(key);
                                existing.quantity += item.quantity;
                                existing.totalPrice += item.price * item.quantity;
                                existing.orders += 1;
                                existing.orderUsers.add(order.user.name);
                                existing.orderDetails.push({
                                    userName: order.user.name,
                                    quantity: item.quantity,
                                    orderNote: order.note || undefined,
                                    itemNote: item.note || undefined,
                                    price: item.price
                                });
                            } else {
                                itemMap.set(key, {
                                    name: item.name,
                                    quantity: item.quantity,
                                    totalPrice: item.price * item.quantity,
                                    orders: 1,
                                    orderUsers: new Set([order.user.name]),
                                    orderDetails: [{
                                        userName: order.user.name,
                                        quantity: item.quantity,
                                        orderNote: order.note || undefined,
                                        itemNote: item.note || undefined,
                                        price: item.price
                                    }]
                                });
                            }
                        }
                    }

                    const eventStatistics = {
                        id: event.id,
                        shop: event.shop,
                        totalOrders: event.orderCount || event.orders?.length || 0,
                        totalAmount: event.totalAmount || (event.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0),
                        participantCount: event.participantCount || participantSet.size,
                        orders: (event.orders || []).map((order: any) => ({
                            id: order.id,
                            total: order.total,
                            note: order.note || undefined,
                            created_at: order.created_at,
                            user: order.user,
                            items: (order.items || []).map((item: any) => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                note: item.note || undefined
                            }))
                        })),
                        itemSummary: Array.from(itemMap.values()).map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            totalPrice: item.totalPrice,
                            orders: item.orders,
                            orderUsers: Array.from(item.orderUsers) as string[],
                            orderDetails: item.orderDetails
                        }))
                    };

                    setEventStats(eventStatistics);
                }
            }
        } catch (error) {
            console.error('獲取事件統計資料失敗:', error);
        } finally {
            setLoadingEventStats(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchEvents();
            fetchMyOrders();
        }
    }, [isAuthenticated, isLoading, user?.id, fetchEvents, fetchMyOrders]);

    // 顯示事件統計
    const showEventStatistics = (eventId: string) => {
        setShowEventStats(true);
        fetchEventStats(eventId);
    };

    // 關閉事件統計
    const closeEventStatistics = () => {
        setShowEventStats(false);
        setEventStats(null);
    };

    // 檢查用戶是否有特定活動的訂單
    const getUserOrderForEvent = (eventId: string): MyOrder | null => {
        return myOrders.find(order => order.event.id === eventId) || null;
    };

    // 關閉訂單詳情 modal
    const closeOrderModal = () => {
        setSelectedOrder(null);
        setShowOrderModal(false);
    };

    // 顯示訂單詳情
    const showOrderDetail = (order: MyOrder) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">請先登入</h2>
                    <p className="mb-4">您需要登入才能使用訂餐功能</p>
                    <Link href={ROUTE_CONSTANTS.LOGIN} className="btn btn-primary">
                        前往登入
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary fallback={<div>載入失敗</div>}>
            <PageContainer>
                {/* 頁面標題 */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">訂餐系統</h1>
                        <p className="text-base-content/70">
                            歡迎回來，{user?.name}！管理您的訂餐活動
                        </p>
                    </div>

                    <div className="flex space-x-2">
                        <Link
                            href="/lunch/events/new"
                            className="btn btn-primary btn-sm"
                        >
                            <FaPlus className="w-4 h-4" />
                            建立活動
                        </Link>
                    </div>
                </div>

                <SearchContainer>
                    <Select
                        label="活動類型"
                        options={[
                            { label: '進行中', value: EventActiveType.ACTIVE },
                            { label: '已結束', value: EventActiveType.INACTIVE },
                        ]}
                        value={selectedActiveType}
                        onChange={setSelectedActiveType}
                        allowClear={true}
                    />
                </SearchContainer>

                {/* <DataTable<LunchEvent>
                    loading={loading}
                    columns={[
                        { title: '活動日期', dataIndex: 'event_date', key: 'event_date' },
                        { title: '活動名稱', dataIndex: 'title', key: 'title' },
                        { title: '活動地點', dataIndex: 'location', key: 'location' },
                        { title: '截止時間', dataIndex: 'order_deadline', key: 'order_deadline' },
                        { title: '訂單數', dataIndex: 'orderCount', key: 'orderCount' },
                        { title: '參與人數', dataIndex: 'participantCount', key: 'participantCount' },
                        {
                            title: '操作', key: 'actions', render: (_: any, record: LunchEvent, index: number) => (
                                <div className="flex space-x-2">
                                    <button className="btn btn-sm">訂餐</button>
                                    <button className="btn btn-sm">統計</button>

                                    <button className="btn btn-sm" popoverTarget={`popover-${index}`}>
                                        Button
                                    </button>

                                    <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" popover="auto" id={`popover-${index}`}>
                                        <li>
                                            <h2 className="menu-title">團長</h2>
                                            <ul>
                                                <li><a>統計</a></li>
                                                <li><a>詳細資訊</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <h2 className="menu-title">通用</h2>
                                            <ul>
                                                <li>
                                                    <a
                                                        onClick={() => {
                                                            const shareUrl = `${window.location.origin}/lunch/events/${record.id}/join`;
                                                            navigator.clipboard.writeText(shareUrl);
                                                            // 可以加入 toast 通知
                                                            alert('分享連結已複製到剪貼簿！');
                                                        }}
                                                    >
                                                        <FaShare className="w-3 h-3" />
                                                        分享
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            )
                        }
                    ]}
                    dataSource={filteredEvents}
                /> */}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <FaSpinner className="w-6 h-6 animate-spin" />
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                user={user}
                                getUserOrderForEvent={getUserOrderForEvent}
                                onShowOrderDetail={showOrderDetail}
                                onShowEventStats={showEventStatistics}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-base-100 rounded-lg border border-base-200">
                        <FaCalendarAlt className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">查無活動</h3>
                    </div>
                )}

                {/* 訂單詳情 Modal */}
                <OrderDetailModal
                    selectedOrder={selectedOrder}
                    isOpen={showOrderModal}
                    onClose={closeOrderModal}
                />

                {/* 事件統計 Modal */}
                {showEventStats && (
                    <div className="modal modal-open">
                        <div className="modal-box w-11/12 max-w-7xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">事件統計</h3>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost"
                                    onClick={closeEventStatistics}
                                >
                                    ✕
                                </button>
                            </div>

                            {loadingEventStats ? (
                                <div className="flex justify-center py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : eventStats ? (
                                <EventStatistics
                                    statistics={eventStats}
                                    className="w-full"
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-base-content/70">無法載入統計資料</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-backdrop" onClick={closeEventStatistics}></div>
                    </div>
                )}
            </PageContainer>
        </ErrorBoundary>
    );
}
