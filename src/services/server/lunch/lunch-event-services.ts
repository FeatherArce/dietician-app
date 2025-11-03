import prisma from '@/services/prisma';
import { LunchEvent, Prisma } from '@/prisma-generated/postgres-client';
import { EventWithOrders } from '@/app/lunch/types';

// 類型定義
export type CreateLunchEventData = {
    title: string;
    description?: string;
    event_date: Date;
    order_deadline: Date;
    start_at?: Date;
    end_at?: Date;
    location?: string;
    is_active?: boolean;
    owner_id: string;
    shop_id?: string;
    allow_custom_items?: boolean;
};

export type UpdateLunchEventData = Partial<Omit<CreateLunchEventData, 'owner_id'>>;

export type LunchEventWithDetails = LunchEvent & {
    owner?: {
        id: string;
        name: string;
        role: string;
    };
    shop?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        menus?: any[];
    };
    orders?: Array<{
        id: string;
        total: number;
        note?: string;
        created_at: Date;
        user: {
            id: string;
            name: string;
        };
        items: Array<{
            id: string;
            name: string;
            quantity: number;
            price: number;
            menu_item?: {
                id: string;
                name: string;
                description?: string;
            };
        }>;
    }>;
    attendees?: Array<{
        id: string;
        name: string;
    }>;
};

export interface LunchEventFilters {
    isActive?: boolean;
    ownerId?: string;
    shopId?: string;
    eventDateFrom?: Date;
    eventDateTo?: Date;
    orderDeadlineFrom?: Date;
    orderDeadlineTo?: Date;
    allowCustomItems?: boolean;
    include?: 'statistics';
}

// Lunch Event Service
export const lunchEventService = {
    // 獲取事件列表（支援過濾）
    async getEvents(filters: LunchEventFilters = {}): Promise<Array<EventWithOrders>> {
        try {
            const where: Prisma.LunchEventWhereInput = {};

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.ownerId) {
                where.owner_id = filters.ownerId;
            }

            if (filters.shopId) {
                where.shop_id = filters.shopId;
            }

            if (filters.allowCustomItems !== undefined) {
                where.allow_custom_items = filters.allowCustomItems;
            }

            // 事件日期範圍
            if (filters.eventDateFrom || filters.eventDateTo) {
                where.event_date = {};
                if (filters.eventDateFrom) {
                    where.event_date.gte = filters.eventDateFrom;
                }
                if (filters.eventDateTo) {
                    where.event_date.lte = filters.eventDateTo;
                }
            }

            // 訂餐截止時間範圍
            if (filters.orderDeadlineFrom || filters.orderDeadlineTo) {
                where.order_deadline = {};
                if (filters.orderDeadlineFrom) {
                    where.order_deadline.gte = filters.orderDeadlineFrom;
                }
                if (filters.orderDeadlineTo) {
                    where.order_deadline.lte = filters.orderDeadlineTo;
                }
            }

            const events = await prisma.lunchEvent.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, name: true, role: true, email: true }
                    },
                    shop: {
                        include: {
                            menus: {
                                where: { is_available: true },
                                include: {
                                    categories: {
                                        where: { is_active: true },
                                        include: {
                                            items: {
                                                where: { is_available: true },
                                                orderBy: { sort_order: 'asc' }
                                            }
                                        },
                                        orderBy: { sort_order: 'asc' }
                                    },
                                    items: {
                                        where: { is_available: true },
                                        orderBy: { sort_order: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    orders: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            items: {
                                include: {
                                    menu_item: {
                                        select: { id: true, name: true, description: true }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            orders: true,
                            attendees: true,
                        }
                    },
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return events;
        } catch (error) {
            console.error('Error fetching lunch events:', error);
            throw new Error('Failed to fetch lunch events');
        }
    },

    // 獲取單一事件（包含詳細資訊）
    async getEventById(id: string, filters: LunchEventFilters = {}): Promise<EventWithOrders | null> {
        try {
            const where: Prisma.LunchEventWhereInput = {};

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.ownerId) {
                where.owner_id = filters.ownerId;
            }

            if (filters.shopId) {
                where.shop_id = filters.shopId;
            }

            if (filters.allowCustomItems !== undefined) {
                where.allow_custom_items = filters.allowCustomItems;
            }

            // 事件日期範圍
            if (filters.eventDateFrom || filters.eventDateTo) {
                where.event_date = {};
                if (filters.eventDateFrom) {
                    where.event_date.gte = filters.eventDateFrom;
                }
                if (filters.eventDateTo) {
                    where.event_date.lte = filters.eventDateTo;
                }
            }

            // 訂餐截止時間範圍
            if (filters.orderDeadlineFrom || filters.orderDeadlineTo) {
                where.order_deadline = {};
                if (filters.orderDeadlineFrom) {
                    where.order_deadline.gte = filters.orderDeadlineFrom;
                }
                if (filters.orderDeadlineTo) {
                    where.order_deadline.lte = filters.orderDeadlineTo;
                }
            }

            const event = await prisma.lunchEvent.findUnique({
                where: { ...where, id },
                include: {
                    owner: {
                        select: { id: true, name: true, role: true, email: true }
                    },
                    shop: {
                        include: {
                            menus: {
                                where: { is_available: true },
                                include: {
                                    categories: {
                                        where: { is_active: true },
                                        include: {
                                            items: {
                                                where: { is_available: true },
                                                orderBy: { sort_order: 'asc' }
                                            }
                                        },
                                        orderBy: { sort_order: 'asc' }
                                    },
                                    items: {
                                        where: { is_available: true },
                                        orderBy: { sort_order: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    orders: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            },
                            items: {
                                include: {
                                    menu_item: {
                                        select: { id: true, name: true, description: true }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            orders: true,
                            attendees: true
                        }
                    }
                }
            });
            return event;
        } catch (error) {
            console.error('Error fetching lunch event:', error);
            throw new Error('Failed to fetch lunch event');
        }
    },

    // 新增事件
    async createEvent(data: CreateLunchEventData): Promise<LunchEvent> {
        try {
            const event = await prisma.lunchEvent.create({
                data: {
                    title: data.title,
                    description: data.description,
                    event_date: data.event_date,
                    order_deadline: data.order_deadline,
                    start_at: data.start_at,
                    end_at: data.end_at,
                    location: data.location,
                    is_active: data.is_active ?? true,
                    owner_id: data.owner_id,
                    shop_id: data.shop_id,
                    allow_custom_items: data.allow_custom_items ?? false,
                },
                include: {
                    owner: {
                        select: { id: true, name: true, role: true }
                    },
                    shop: {
                        select: { id: true, name: true }
                    }
                }
            });
            return event;
        } catch (error) {
            console.error('Error creating lunch event:', error);
            throw new Error('Failed to create lunch event');
        }
    },

    // 更新事件
    async updateEvent(id: string, data: UpdateLunchEventData): Promise<LunchEvent> {
        try {
            const event = await prisma.lunchEvent.update({
                where: { id },
                data,
                include: {
                    owner: {
                        select: { id: true, name: true, role: true }
                    },
                    shop: {
                        select: { id: true, name: true }
                    }
                }
            });
            return event;
        } catch (error) {
            console.error('Error updating lunch event:', error);
            throw new Error('Failed to update lunch event');
        }
    },

    // 刪除事件
    async deleteEvent(id: string): Promise<LunchEvent> {
        try {
            // 檢查是否有訂單
            const orderCount = await prisma.lunchOrder.count({
                where: { event_id: id }
            });

            if (orderCount > 0) {
                throw new Error('無法刪除已有訂單的事件');
            }

            const event = await prisma.lunchEvent.delete({
                where: { id }
            });
            return event;
        } catch (error) {
            console.error('Error deleting lunch event:', error);
            throw new Error('Failed to delete lunch event');
        }
    },

    // 切換事件狀態
    async toggleEventStatus(id: string): Promise<LunchEvent> {
        try {
            const currentEvent = await this.getEventById(id);
            if (!currentEvent) {
                throw new Error('Event not found');
            }

            const event = await prisma.lunchEvent.update({
                where: { id },
                data: { is_active: !currentEvent.is_active }
            });
            return event;
        } catch (error) {
            console.error('Error toggling event status:', error);
            throw new Error('Failed to toggle event status');
        }
    },

    // 檢查訂餐是否仍在期限內
    async isOrderingAvailable(eventId: string): Promise<boolean> {
        try {
            const event = await prisma.lunchEvent.findUnique({
                where: { id: eventId },
                select: { order_deadline: true, is_active: true }
            });

            if (!event || !event.is_active) {
                return false;
            }

            return new Date() < event.order_deadline;
        } catch (error) {
            console.error('Error checking ordering availability:', error);
            return false;
        }
    },

    // 獲取使用者的事件（發起的和參與的）
    async getUserEvents(userId: string): Promise<{
        owned: LunchEvent[];
        joined: LunchEvent[];
    }> {
        try {
            const [owned, joined] = await Promise.all([
                // 發起的事件
                prisma.lunchEvent.findMany({
                    where: { owner_id: userId },
                    include: {
                        shop: {
                            select: { id: true, name: true }
                        },
                        _count: {
                            select: { orders: true, attendees: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                }),
                // 參與的事件
                prisma.lunchEvent.findMany({
                    where: {
                        orders: {
                            some: { user_id: userId }
                        }
                    },
                    include: {
                        owner: {
                            select: { id: true, name: true }
                        },
                        shop: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                })
            ]);

            return { owned, joined };
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw new Error('Failed to fetch user events');
        }
    }
};

// 向後相容的函數（保留現有的 getLunchEvents）
export async function getLunchEvents(): Promise<LunchEvent[]> {
    return lunchEventService.getEvents({ isActive: true });
}