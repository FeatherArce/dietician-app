import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/services/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const isActive = searchParams.get('is_active');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        // 構建查詢條件
        const whereCondition: {
            OR: Array<{
                owner_id?: string;
                orders?: {
                    some: {
                        user_id: string;
                    };
                };
            }>;
            is_active?: boolean;
        } = {
            OR: [
                // 使用者建立的活動
                { owner_id: userId },
                // 使用者有訂單的活動
                {
                    orders: {
                        some: {
                            user_id: userId
                        }
                    }
                }
            ]
        };

        // 如果只要活躍的活動
        if (isActive === 'true') {
            whereCondition.is_active = true;
        }

        const events = await prisma.lunchEvent.findMany({
            where: whereCondition,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                shop: {
                    select: {
                        id: true,
                        name: true,
                        is_active: true
                    }
                },
                _count: {
                    select: {
                        orders: true,
                        attendees: true
                    }
                }
            },
            orderBy: [
                { is_active: 'desc' },
                { created_at: 'desc' }
            ]
        });

        return NextResponse.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Error fetching participated events:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch participated events'
        }, { status: 500 });
    }
}