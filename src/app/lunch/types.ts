import { LunchEvent, LunchOrder, LunchOrderItem, Menu, Shop, User } from '@/prisma-generated/postgres-client';

export interface EventShop extends Shop{
    menus: Array<Menu>;    
}

export interface EventOrderItem extends LunchOrderItem{
  [key: string]: unknown; // 添加索引簽章以符合 Record<string, unknown>
}

export interface EventOrder extends LunchOrder {
    user?: Partial<User>;
    items: LunchOrderItem[];
}

/**
 * 我的訂單介面
 */
export interface MyOrder extends EventOrder {
    event: LunchEvent;

    [x: string]: unknown;
}

export interface EventWithOrders extends LunchEvent {
    orders: Array<EventOrder>;
}

/**
 * 擴展的午餐活動介面，包含額外的關聯資料
 */
export interface EventWithDetails extends LunchEvent {
    owner?: User;
    shop?: EventShop;
    orders?: Array<EventOrder>;
    attendees?: Array<User>;
    // 額外的計數欄位
    _count?: {
        orders: number;
        attendees: number;
    };
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
    shop?: EventShop;
    totalOrders: number;
    totalAmount: number;
    participantCount: number;
    orders: EventOrder[];
    itemSummary: ItemSummary[];
}