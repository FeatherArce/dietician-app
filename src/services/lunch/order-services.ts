import prisma from '@/libs/prisma';
import { Prisma } from '@/prisma-generated/postgres-client';
import { LunchOrderWithArgs } from '@/types/api/lunch';
import { LunchOrderFilters } from './lunch-event-services';

// 類型定義
export type CreateOrderData = {
    user_id: string;
    event_id: string;
    note?: string;
    items: CreateOrderItemData[];
};

export type CreateOrderItemData = {
    name: string;
    price: number;
    quantity?: number;
    note?: string;
    description?: string;  // 新增：快照描述
    category_name?: string; // 新增：快照分類名稱
    menu_item_id?: string;  // 可選：用於統計和追蹤
};

export type UpdateOrderData = {
    note?: string;
    items?: CreateOrderItemData[];
};

// Order Service
export const orderService = {
    // 輔助函數：從菜單項目建立訂單項目（含快照）
    async createOrderItemFromMenuItem(menuItemId: string, quantity: number = 1, note?: string): Promise<CreateOrderItemData> {
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
            include: {
                category: {
                    select: { name: true }
                }
            }
        });

        if (!menuItem) {
            throw new Error(`菜單項目 ${menuItemId} 不存在`);
        }

        if (!menuItem.is_available) {
            throw new Error(`菜單項目 ${menuItem.name} 目前無法點選`);
        }

        return {
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            note,
            description: menuItem.description || undefined,
            category_name: menuItem.category?.name || undefined,
            menu_item_id: menuItemId
        };
    },

    // 獲取訂單列表
    async getOrders(filters: LunchOrderFilters) {
        try {
            const where: Prisma.LunchOrderWhereInput = {};
            
            if (filters.userId) {
                where.user_id = filters.userId;
            }
            
            if (filters.eventId) {
                where.event_id = filters.eventId;
            }

            const orders = await prisma.lunchOrder.findMany({
                where,
                include: LunchOrderWithArgs.include,
                orderBy: { created_at: 'desc' }
            });
            
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw new Error('Failed to fetch orders');
        }
    },

    // 獲取單一訂單
    async getOrderById(id: string) {
        try {
            const order = await prisma.lunchOrder.findUnique({
                where: { id },
                include: {
                    user: {
                        select: { id: true, name: true }
                    },
                    event: {
                        select: { 
                            id: true, 
                            title: true, 
                            event_date: true,
                            order_deadline: true,
                            is_active: true,
                            allow_custom_items: true,
                            owner_id: true
                        }
                    },
                    items: {
                        include: {
                            menu_item: {
                                select: { 
                                    id: true, 
                                    name: true, 
                                    description: true,
                                    price: true,
                                    image_url: true
                                }
                            }
                        },
                        orderBy: { id: 'asc' }
                    }
                }
            });
            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw new Error('Failed to fetch order');
        }
    },

    // 獲取使用者在特定事件的訂單
    async getUserOrderForEvent(userId: string, eventId: string) {
        try {
            const order = await prisma.lunchOrder.findUnique({
                where: {
                    user_id_event_id: {
                        user_id: userId,
                        event_id: eventId
                    }
                },
                include: {
                    items: {
                        include: {
                            menu_item: {
                                select: { 
                                    id: true, 
                                    name: true, 
                                    description: true,
                                    price: true,
                                    image_url: true
                                }
                            }
                        },
                        orderBy: { id: 'asc' }
                    },
                    event: {
                        select: { 
                            id: true, 
                            title: true, 
                            order_deadline: true,
                            is_active: true
                        }
                    }
                }
            });
            return order;
        } catch (error) {
            console.error('Error fetching user order for event:', error);
            throw new Error('Failed to fetch user order for event');
        }
    },

    // 新增訂單
    async createOrder(data: CreateOrderData) {
        try {
            // 檢查事件是否還在訂餐期限內
            const event = await prisma.lunchEvent.findUnique({
                where: { id: data.event_id },
                select: { order_deadline: true, is_active: true }
            });

            if (!event || !event.is_active) {
                throw new Error('事件不存在或已關閉');
            }

            if (new Date() > event.order_deadline) {
                throw new Error('已超過訂餐截止時間');
            }

            // 檢查使用者是否已有訂單
            const existingOrder = await this.getUserOrderForEvent(data.user_id, data.event_id);
            if (existingOrder) {
                throw new Error('您已經在此事件中有訂單，請使用更新功能');
            }

            // 計算總價
            const total = data.items.reduce((sum, item) => {
                return sum + (item.price * (item.quantity || 1));
            }, 0);

            const order = await prisma.lunchOrder.create({
                data: {
                    user_id: data.user_id,
                    event_id: data.event_id,
                    note: data.note,
                    total,
                    items: {
                        create: await Promise.all(data.items.map(async (item) => {
                            // 如果有 menu_item_id，自動填充快照資料
                            let snapshotData = {
                                name: item.name,
                                price: item.price,
                                description: item.description,
                                category_name: item.category_name
                            };

                            if (item.menu_item_id) {
                                try {
                                    const menuItem = await prisma.menuItem.findUnique({
                                        where: { id: item.menu_item_id },
                                        include: {
                                            category: {
                                                select: { name: true }
                                            }
                                        }
                                    });

                                    if (menuItem) {
                                        // 使用菜單項目的最新資料作為快照
                                        snapshotData = {
                                            name: menuItem.name,
                                            price: menuItem.price,
                                            description: menuItem.description || undefined,
                                            category_name: menuItem.category?.name || undefined
                                        };
                                    }
                                } catch {
                                    // 如果菜單項目不存在，使用傳入的資料
                                    console.warn(`MenuItem ${item.menu_item_id} not found, using provided data`);
                                }
                            }

                            return {
                                name: snapshotData.name,
                                price: snapshotData.price,
                                quantity: item.quantity || 1,
                                note: item.note,
                                description: snapshotData.description,
                                category_name: snapshotData.category_name,
                                menu_item_id: item.menu_item_id
                            };
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            menu_item: {
                                select: { 
                                    id: true, 
                                    name: true, 
                                    description: true 
                                }
                            }
                        }
                    },
                    event: {
                        select: { id: true, title: true }
                    }
                }
            });

            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error instanceof Error ? error : new Error('Failed to create order');
        }
    },

    // 更新訂單
    async updateOrder(orderId: string, data: UpdateOrderData) {
        try {
            // 檢查訂單是否存在並獲取事件資訊
            const existingOrder = await this.getOrderById(orderId);
            if (!existingOrder) {
                throw new Error('訂單不存在');
            }

            // 檢查是否還在訂餐期限內
            if (new Date() > existingOrder.event.order_deadline) {
                throw new Error('已超過訂餐截止時間，無法修改訂單');
            }

            if (!existingOrder.event.is_active) {
                throw new Error('事件已關閉，無法修改訂單');
            }

            const updateData: Prisma.LunchOrderUpdateInput = {};

            if (data.note !== undefined) {
                updateData.note = data.note;
            }

            // 如果有更新項目，需要重新計算總價
            if (data.items) {
                const total = data.items.reduce((sum, item) => {
                    return sum + (item.price * (item.quantity || 1));
                }, 0);

                updateData.total = total;
                updateData.items = {
                    deleteMany: {
                        order_id: orderId
                    }, // 刪除該訂單的所有現有項目
                    create: await Promise.all(data.items.map(async (item) => {
                        // 如果有 menu_item_id，自動填充快照資料
                        let snapshotData = {
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            category_name: item.category_name
                        };

                        if (item.menu_item_id) {
                            try {
                                const menuItem = await prisma.menuItem.findUnique({
                                    where: { id: item.menu_item_id },
                                    include: {
                                        category: {
                                            select: { name: true }
                                        }
                                    }
                                });

                                if (menuItem) {
                                    // 使用菜單項目的最新資料作為快照
                                    snapshotData = {
                                        name: menuItem.name,
                                        price: menuItem.price,
                                        description: menuItem.description || undefined,
                                        category_name: menuItem.category?.name || undefined
                                    };
                                }
                            } catch {
                                // 如果菜單項目不存在，使用傳入的資料
                                console.warn(`MenuItem ${item.menu_item_id} not found, using provided data`);
                            }
                        }

                        return {
                            name: snapshotData.name,
                            price: snapshotData.price,
                            quantity: item.quantity || 1,
                            note: item.note,
                            description: snapshotData.description,
                            category_name: snapshotData.category_name,
                            menu_item_id: item.menu_item_id
                        };
                    }))
                };
            }

            const order = await prisma.lunchOrder.update({
                where: { id: orderId },
                data: updateData,
                include: {
                    items: {
                        include: {
                            menu_item: {
                                select: { 
                                    id: true, 
                                    name: true, 
                                    description: true 
                                }
                            }
                        }
                    },
                    event: {
                        select: { id: true, title: true }
                    }
                }
            });

            return order;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error instanceof Error ? error : new Error('Failed to update order');
        }
    },

    // 刪除訂單
    async deleteOrder(orderId: string) {
        try {
            // 檢查訂單是否存在並獲取事件資訊
            const existingOrder = await this.getOrderById(orderId);
            if (!existingOrder) {
                throw new Error('訂單不存在');
            }

            // 檢查是否還在訂餐期限內
            if (new Date() > existingOrder.event.order_deadline) {
                throw new Error('已超過訂餐截止時間，無法刪除訂單');
            }

            const order = await prisma.lunchOrder.delete({
                where: { id: orderId },
                include: {
                    items: true
                }
            });

            return order;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error instanceof Error ? error : new Error('Failed to delete order');
        }
    },

    async deleteOrders(orderIds: string[]) {
        try {
            // 批次刪除訂單
            const deletedOrders = await prisma.lunchOrder.deleteMany({
                where: {
                    id: { in: orderIds }
                }
            });
            return deletedOrders;
        } catch (error) {
            console.error('Error deleting orders:', error);
            throw error instanceof Error ? error : new Error('Failed to delete orders');
        }
    },

    // 獲取事件的訂餐統計
    async getEventOrdersSummary(eventId: string) {
        try {
            const [orders, totalAmount, totalOrders] = await Promise.all([
                // 獲取所有訂單
                prisma.lunchOrder.findMany({
                    where: { event_id: eventId },
                    include: {
                        user: {
                            select: { id: true, name: true }
                        },
                        items: {
                            include: {
                                menu_item: {
                                    select: { 
                                        id: true, 
                                        name: true 
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { created_at: 'asc' }
                }),
                // 計算總金額
                prisma.lunchOrder.aggregate({
                    where: { event_id: eventId },
                    _sum: { total: true }
                }),
                // 計算訂單數量
                prisma.lunchOrder.count({
                    where: { event_id: eventId }
                })
            ]);

            // 統計各項目的數量
            const itemSummary = new Map<string, {
                name: string;
                quantity: number;
                totalPrice: number;
                orders: number;
            }>();

            (orders || []).forEach(order => {
                order.items.forEach(item => {
                    const key = item.menu_item_id || item.name;
                    const existing = itemSummary.get(key);
                    
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.totalPrice += item.price * item.quantity;
                        existing.orders += 1;
                    } else {
                        itemSummary.set(key, {
                            name: item.name,
                            quantity: item.quantity,
                            totalPrice: item.price * item.quantity,
                            orders: 1
                        });
                    }
                });
            });

            return {
                orders,
                totalAmount: totalAmount._sum.total || 0,
                totalOrders,
                itemSummary: Array.from(itemSummary.values())
            };
        } catch (error) {
            console.error('Error fetching event orders summary:', error);
            throw new Error('Failed to fetch event orders summary');
        }
    },

    // 更新收款狀態 (暫時註解，等資料庫遷移完成後啟用)
    async updatePaymentStatus(orderId: string, paymentData: {
        is_paid: boolean;
        paid_at?: Date | null;
        paid_method?: string | null;
        paid_note?: string | null;
    }) {
        try {
           
            const order = await prisma.lunchOrder.update({
                where: { id: orderId },
                data: paymentData,
                include: {
                    items: {
                        include: {
                            menu_item: {
                                select: { 
                                    id: true, 
                                    name: true, 
                                    description: true 
                                }
                            }
                        }
                    },
                    event: {
                        select: { 
                            id: true, 
                            title: true,
                            owner_id: true 
                        }
                    },
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });

            return order;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error instanceof Error ? error : new Error('Failed to update payment status');
        }
    }
};

export default orderService;