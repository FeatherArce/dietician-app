import { LunchOrder, Menu, Shop } from "@/prisma-generated/postgres-client";
import { ApiResponse } from "./api";
import { ILunchEvent } from "../LunchEvent";
import { Prisma } from "@/prisma-generated/postgres-client";

const menuWithArgs = Prisma.validator<Prisma.MenuDefaultArgs>()({
    include: {
        items: true,
        categories: true,
        _count: {
            select: {
                items: true,
            }
        }
    },
});
export type MenuWithArgs = Prisma.MenuGetPayload<typeof menuWithArgs>;
const shopWithArgs = Prisma.validator<Prisma.ShopDefaultArgs>()({
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

// src/app/api/lunch/events 的回應型別定義
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