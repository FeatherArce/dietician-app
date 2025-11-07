import { LunchEvent, LunchOrder, LunchOrderItem, Menu, Shop, User } from '@/prisma-generated/postgres-client';

export interface EventShop extends Shop {
    menus: Array<Menu>;
}

export interface EventOrderItem extends LunchOrderItem {
    [key: string]: unknown; // 添加索引簽章以符合 Record<string, unknown>
}

export interface EventOrder extends LunchOrder {
    user?: Partial<User>;
    items: LunchOrderItem[];
    [key: string]: unknown;
}

/**
 * 我的訂單介面
 */
export interface MyOrder extends EventOrder {
    event: LunchEvent;

    [x: string]: unknown;
}

export interface LunchOrderItemStatistic {
    name: string;
    quantity: number;
    price: number;
    total: number;
    items: EventOrderItem[];
}

export interface LunchEventStatistics {
    _count?: {
        orders?: number;
        total_amount?: number;
        attendees?: number;
        paid_orders?: number;
        unpaid_orders?: number;
    };
    _statistics?: {
        groupByLunchOrderItems: LunchOrderItemStatistic[];
    };
}

export interface PrismaLunchEvent extends LunchEvent, LunchEventStatistics {   
    [x: string]: unknown;
}

export interface EventWithOrders extends PrismaLunchEvent {
    orders?: Array<EventOrder>;
}

/**
 * 擴展的午餐活動介面，包含額外的關聯資料
 */
export interface EventWithDetails extends EventWithOrders {
    owner?: User;
    shop?: EventShop;
    attendees?: Array<User>;
}