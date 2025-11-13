import { EventOrderItem, EventWithDetails, EventWithOrders, LunchEventStatistics } from "@/app/lunch/types";
import type { LunchEventFilters } from '@/services/server/lunch/lunch-event-services';
import { NextRequest } from "next/server";

export interface LunchOrderItemStatistic {
    name: string;
    quantity: number;
    price: number;
    total: number;
    items: EventOrderItem[];
}

export function getEventRequestFilters(request: NextRequest): LunchEventFilters {
    const searchParams = request.nextUrl.searchParams;
    const filters: LunchEventFilters = {};

    const isActiveParam = searchParams.get('is_active');
    if (isActiveParam !== null) {
        filters.isActive = isActiveParam === 'true';
    }

    const ownerIdParam = searchParams.get('owner_id');
    if (ownerIdParam) {
        filters.ownerId = ownerIdParam;
    }

    const dateFromParam = searchParams.get('date_from');
    if (dateFromParam) {
        filters.eventDateFrom = new Date(dateFromParam);
    }

    const dateToParam = searchParams.get('date_to');
    if (dateToParam) {
        filters.eventDateTo = new Date(dateToParam);
    }

    return filters;
}

function getAttendees(event: EventWithDetails | EventWithOrders) {
    const newAttendees = new Map<string, { id: string; name: string, email: string }>();
    for (const order of event?.orders || []) {
        if (!newAttendees.has(order.id)) {
            newAttendees.set(order.id, {
                id: order.id,
                name: order.user?.name || '',
                email: order.user?.email || '',
            });
        }
    }
    return Array.from(newAttendees.values());
}

function getStatistics(event: EventWithDetails): LunchEventStatistics {
    // 統計餐點的總數量 (不重複計算相同餐點)
    const lunchOrderItemMap = new Map<string, LunchOrderItemStatistic>();
    let totalAmount = 0;
    let paidOrdersCount = 0;
    let unpaidOrdersCount = 0;
    for (const order of event.orders || []) {
        // 計算總金額
        totalAmount += order.total;

        // 計算已付款與未付款訂單數量
        if (order.is_paid) {
            paidOrdersCount += 1;
        } else {
            unpaidOrdersCount += 1;
        }

        // 統計餐點數量
        for (const item of order.items || []) {
            const itemKey = `${item.name}-${item.price}`;
            if (lunchOrderItemMap.has(itemKey)) {
                const existingItem = lunchOrderItemMap.get(itemKey)!;
                existingItem.quantity += item.quantity;
                existingItem.total += item.quantity * item.price;
                existingItem.items.push(item);
            } else {
                lunchOrderItemMap.set(itemKey, {
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price,
                    items: [item],
                });
            }
        }
    }

    return ({
        _count: {
            ...event._count,
            total_amount: totalAmount,
            paid_orders: paidOrdersCount,
            unpaid_orders: unpaidOrdersCount,
        },
        _statistics: {
            groupByLunchOrderItems: Array.from(lunchOrderItemMap.values()),
        },
    });
}

export function getEventDetails(event: EventWithDetails | EventWithOrders): EventWithDetails {
    const newEventAttendees = getAttendees(event);
    // const totalAmount = (event.orders || []).reduce((sum, order) => sum + order.total, 0);
    const newStatistics = getStatistics(event as EventWithDetails);
    // 添加統計資料到事件物件
    const newEventWithOrders: EventWithOrders = {
        ...event,
        ...newStatistics,
        _count:{
            ...event._count,
            ...newStatistics._count,
            attendees: newEventAttendees.length,
        },
        attendees: newEventAttendees,
    };
    return newEventWithOrders;
}