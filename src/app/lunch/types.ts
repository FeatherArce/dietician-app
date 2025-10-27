import { LunchEvent } from '@/prisma-generated/postgres-client';

/**
 * 擴展的午餐活動介面，包含額外的關聯資料
 */
export interface EventWithDetails extends LunchEvent {
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
    _count?: {
        orders: number;
        attendees: number;
    };
    orders?: Array<unknown>;  // 訂單陣列
    attendees?: Array<unknown>;  // 參與者陣列
}

/**
 * 訂單項目介面
 */
export interface MyOrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: string;
}

/**
 * 我的訂單介面
 */
export interface MyOrder {
    id: string;
    total: number;
    note?: string;
    created_at: string;
    updated_at: string;
    // 收款相關欄位
    is_paid: boolean;
    paid_at?: string;
    paid_method?: string;
    paid_note?: string;
    items: MyOrderItem[];
    event: {
        id: string;
        title: string;
        event_date: string;
        order_deadline: string;
        is_active: boolean;
    };
}

/**
 * 使用者介面 (用於元件 props)
 */
export interface User {
    id: string;
    name: string;
    role: string;
}

/**
 * 訂單詳細資料介面 (用於統計)
 */
export interface OrderDetail {
    id: string;
    total: number;
    note?: string;
    created_at: Date;
    // 收款相關欄位
    is_paid?: boolean;
    paid_at?: Date;
    paid_method?: string;
    paid_note?: string;
    user: {
        id: string;
        name: string;
    };
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        note?: string;
    }>;
}

/**
 * 餐點統計介面 (依餐點分組)
 */
export interface ItemSummary {
    name: string;
    quantity: number;
    totalPrice: number;
    orders: number;
    orderUsers: string[];
    orderDetails: Array<{
        userName: string;
        quantity: number;
        orderNote?: string;  // 訂單層級備註
        itemNote?: string;   // 餐點項目層級備註
        price: number;
    }>;
}

/**
 * 統計資料介面
 */
export interface EventStatistics {
    id: string;
    shop?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
    };
    totalOrders: number;
    totalAmount: number;
    participantCount: number;
    orders: OrderDetail[];
    itemSummary: ItemSummary[];
}