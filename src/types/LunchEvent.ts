import { MenuCategory, MenuItem, Menu, Shop, LunchEvent } from "@/prisma-generated/postgres-client";

export interface EventMenuItem extends MenuItem {
    // 可以根據需要添加額外的屬性
    trigger_at?: string;
    [key: string]: any;
}

export interface EventMenuCategory extends MenuCategory {
    items: Array<EventMenuItem>;
}

export interface EventMenu extends Menu {
    categories: Array<EventMenuCategory>;
    items: Array<EventMenuItem>;
}

export interface EventShop extends Shop {
    menus: EventMenu[];
}

export interface EventData extends LunchEvent {
    owner: {
        id: string;
        name: string;
    };
    shop?: EventShop;
}
