import { LunchOrder, Menu, Shop } from "@/prisma-generated/postgres-client";
import { ApiResponse } from "./api";
import { ILunchEvent } from "../LunchEvent";
import { Prisma } from "@/prisma-generated/postgres-client";

// src/app/api/lunch/shops/[id]/menu/[id]/items 的回應型別定義
export const menuItemWithArgs = Prisma.validator<Prisma.MenuItemDefaultArgs>()({
    include: {
        category: true,
        menu: {
            include: {
                categories: true,
                items: true,
            }
        },
    },
});
export type MenuItemWithArgs = Prisma.MenuItemGetPayload<typeof menuItemWithArgs>;

// src/app/api/lunch/shops/[id]/menu/[id] 的回應型別定義
export const menuWithArgs = Prisma.validator<Prisma.MenuDefaultArgs>()({
    include: {
        items: true,
        categories: {
            include: {
                items: true,
            }
        },
        _count: {
            select: {
                items: true,
            }
        }
    },
});
export type MenuWithArgs = Prisma.MenuGetPayload<typeof menuWithArgs>;

// src/app/api/lunch/shops/[id] 的回應型別定義
export const shopWithArgs = Prisma.validator<Prisma.ShopDefaultArgs>()({
    include: {
        events: true,
        menus: menuWithArgs,
        _count: {
            select: {
                menus: true,
                events: true,
            },
        },
    },
});
export type ShopWithArgs = Prisma.ShopGetPayload<typeof shopWithArgs>;

// src/app/api/lunch/orders/ 的回應型別定義
export const LunchOrderWithArgs = Prisma.validator<Prisma.LunchOrderDefaultArgs>()({
    include: {
        user: {
            select: { id: true, name: true }
        },
        event: true,
        items: {
            include: {
                menu_item: true,
            },
            orderBy: { id: 'asc' }
        }
    }
});
export type LunchOrderWithArgs = Prisma.LunchOrderGetPayload<typeof LunchOrderWithArgs>;


// src/app/api/lunch/events 的回應型別定義
export type GetEventsResponse = ApiResponse<{ events: ILunchEvent[] }>;
export type GetEventResponse = ApiResponse<{ event: ILunchEvent }>;

// src/app/api/lunch/shops 的回應型別定義
export type GetShopsResponse = ApiResponse<{ shops: Shop[] }>;
export type PostShopResponse = ApiResponse<{ shop: Shop, defaultMenu: Menu }>;
export type PutShopResponse = ApiResponse<{ shop: Shop }>;
export type DeleteShopResponse = ApiResponse<{ shop: Shop }>;

// src/app/api/lunch/shops/[id] 的回應型別定義
export type GetShopResponse = ApiResponse<{ shop: ShopWithArgs }>;

// src/app/api/lunch/orders 的回應型別定義
export type DeleteOrderResponse = ApiResponse<{ orderId: string, order: LunchOrder }>;

// src/app/api/lunch/shops/[id]/menus/[menuId]/items 的回應型別定義
export type GetShopMenuItemsResponse = ApiResponse<{ items: MenuItemWithArgs[] }>;
export type PostShopMenuItemResponse = ApiResponse<{ item: MenuItemWithArgs }>;
export type PostBatchShopMenuItemsResponse = ApiResponse<{ count: number }>;
export type PutShopMenuItemResponse = ApiResponse<{ item: MenuItemWithArgs }>;
export type DeleteShopMenuItemResponse = ApiResponse<{ id: string, item: MenuItemWithArgs }>;

export type GetLunchOrdersResponse = ApiResponse<{ orders: LunchOrderWithArgs[] }>;