import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/services/prisma';
import type { EventOrder, EventStatistics } from '@/app/lunch/types';

export async function GET(request: NextRequest) {
    try {
        // 暫時跳過身份驗證，直接處理請求
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // 獲取用戶參與的所有活動
        const userEvents = await prisma.lunchEvent.findMany({
            where: {
                OR: [
                    { owner_id: userId }, // 使用者建立的活動
                    {
                        orders: {
                            some: { user_id: userId } // 使用者有訂單的活動
                        }
                    }
                ]
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true
                    }
                },
                orders: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                        items: true
                    }
                }
            }
        });

        if (userEvents.length === 0) {
            return NextResponse.json({
                shop: undefined,
                totalOrders: 0,
                totalAmount: 0,
                participantCount: 0,
                orders: [],
                itemSummary: []
            });
        }

        // 計算總統計
        let totalOrders = 0;
        let totalAmount = 0;
        const allOrders: Array<EventOrder> = [];
        const itemMap = new Map();
        const participantSet = new Set();

        // 匯總所有活動的資料
        for (const event of userEvents) {
            for (const order of event.orders) {
                totalOrders++;
                totalAmount += order.total;
                participantSet.add(order.user_id);

                allOrders.push(order);

                // 計算餐點統計
                for (const item of order.items) {
                    const key = item.name;
                    if (itemMap.has(key)) {
                        const existing = itemMap.get(key);
                        existing.quantity += item.quantity;
                        existing.totalPrice += item.price * item.quantity;
                        existing.orders += 1;
                        existing.orderUsers.add(order.user.name);
                        existing.orderDetails.push({
                            userName: order.user.name,
                            quantity: item.quantity,
                            orderNote: order.note || undefined,
                            itemNote: item.note || undefined,
                            price: item.price
                        });
                    } else {
                        itemMap.set(key, {
                            name: item.name,
                            quantity: item.quantity,
                            totalPrice: item.price * item.quantity,
                            orders: 1,
                            orderUsers: new Set([order.user.name]),
                            orderDetails: [{
                                userName: order.user.name,
                                quantity: item.quantity,
                                orderNote: order.note || undefined,
                                itemNote: item.note || undefined,
                                price: item.price
                            }]
                        });
                    }
                }
            }
        }

        // 轉換餐點統計格式
        const itemSummary = Array.from(itemMap.values()).map(item => ({
            name: item.name,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            orders: item.orders,
            orderUsers: Array.from(item.orderUsers) as string[],
            orderDetails: item.orderDetails
        }));

        // 準備回應資料
        const statistics: EventStatistics = {
            id: 'global', // 全域統計使用特殊 ID
            shop: undefined, // 全域統計不顯示特定店家
            totalOrders,
            totalAmount,
            participantCount: participantSet.size,
            orders: allOrders,
            itemSummary
        };

        return NextResponse.json(statistics);

    } catch (error) {
        console.error('獲取全域統計失敗:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}