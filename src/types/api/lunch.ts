import { Menu, Shop } from "@/prisma-generated/postgres-client";
import { ApiResponse } from "./api";
import { EventWithDetails } from "@/app/lunch/types";

// src/app/api/lunch/events 的回應型別定義
export type GetEventResponse = ApiResponse<{ event: EventWithDetails }>;

// src/app/api/lunch/shops 的回應型別定義
export type GetShopsResponse = ApiResponse<{ shops: Shop[] }>;
export type PostShopResponse = ApiResponse<{ shop: Shop, defaultMenu: Menu }>;
export type PutShopResponse = ApiResponse<{ shop: Shop }>;
export type DeleteShopResponse = ApiResponse<{ shop: Shop }>;

// src/app/api/lunch/shops/menus 的回應型別定義