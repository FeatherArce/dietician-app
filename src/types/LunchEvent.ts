import { MenuCategory, MenuItem, Menu, Shop, LunchEvent, LunchOrder, LunchOrderItem, User } from "@/prisma-generated/postgres-client";

// #region Shop and Menu Interfaces
export interface IShopMenuItem extends MenuItem {
    // 可以根據需要添加額外的屬性
    trigger_at?: string;
    [key: string]: any;
}

export interface IShopMenuCategory extends MenuCategory {
    items: Array<IShopMenuItem>;
}

export interface IShopMenu extends Menu {
    items: Array<IShopMenuItem>;
    categories: Array<IShopMenuCategory>;
}

export interface IShop extends Shop {
    menus: Array<IShopMenu>;
}

// #endregion

// #region Lunch Order and Event Interfaces

export interface ILunchOrderItem extends LunchOrderItem {
    [key: string]: unknown; // 添加索引簽章以符合 Record<string, unknown>
}

export interface ILunchOrder extends LunchOrder {
    user?: Partial<User>;
    items: ILunchOrderItem[];
    [key: string]: unknown;
}

export interface MyOrder extends ILunchOrder {
    event: LunchEvent;

    [x: string]: unknown;
}

export interface LunchOrderItemStatistic {
    name: string;
    quantity: number;
    price: number;
    total: number;
    items: ILunchOrderItem[];
}

// #endregion

// #region Lunch Event Interfaces

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

export interface ILunchEvent extends LunchEvent, LunchEventStatistics {
    [x: string]: unknown;
}
export interface ILunchEvent extends LunchEvent {    
    shop?: IShop | null;
    orders?: Array<ILunchOrder>;
      owner?: Partial<User>;
    attendees?: Array<Partial<User>>;
}

// #endregion