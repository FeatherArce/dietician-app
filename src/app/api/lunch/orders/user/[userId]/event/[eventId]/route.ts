import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/server/auth/request-utils';
import { orderService } from '@/services/server/lunch/order-services';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string; eventId: string }> }
) {
    try {
        const session = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json(
                { error: '未授權訪問', success: false }, 
                { status: 401 }
            );
        }

        const { userId, eventId } = await params;

        // 檢查權限：只能查看自己的訂單，除非是管理員
        if (session.userId !== userId && session.role !== 'ADMIN' && session.role !== 'MODERATOR') {
            return NextResponse.json(
                { error: '權限不足', success: false }, 
                { status: 403 }
            );
        }

        // 使用過濾器獲取特定用戶在特定事件的訂單
        const orders = await orderService.getOrders({
            userId,
            eventId
        });

        // 應該只有一個訂單（根據 schema 的 unique 約束）
        const order = orders.length > 0 ? orders[0] : null;

        return NextResponse.json({ 
            order, 
            success: true 
        });

    } catch (error) {
        console.error('GET /api/lunch/orders/user/[userId]/event/[eventId] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order', success: false }, 
            { status: 500 }
        );
    }
}