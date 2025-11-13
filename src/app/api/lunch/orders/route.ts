import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import { orderService } from '@/services/server/lunch/order-services';
import { ApiMessage } from '../../utils';

// 創建新訂單
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return ApiMessage.error(401);
        }

        const data = await request.json();
        const { event_id, items, note } = data;

        // 驗證必要欄位
        if (!event_id || !items || items.length === 0) {
            return NextResponse.json(
                { error: '缺少必要欄位', success: false },
                { status: 400 }
            );
        }

        // 檢查是否已有訂單存在
        const existingOrder = await orderService.getUserOrderForEvent(session.user?.id, event_id);
        if (existingOrder) {
            return NextResponse.json(
                { error: '您已經有訂單了，請使用更新功能', success: false },
                { status: 409 }
            );
        }

        const order = await orderService.createOrder({
            user_id: session.user?.id,
            event_id,
            items,
            note: note || ''
        });

        return NextResponse.json({
            order,
            message: '訂單已建立',
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('POST /api/lunch/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', success: false },
            { status: 500 }
        );
    }
}

// 獲取訂單列表
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('event_id') || searchParams.get('eventId');
        const userId = searchParams.get('user_id') || searchParams.get('userId');

        let orders;
        if (eventId) {
            orders = await orderService.getOrders({ eventId: eventId });
        } else if (userId) {
            orders = await orderService.getOrders({ userId: userId });
        } else {
            // 一般用戶只能看自己的訂單
            orders = await orderService.getOrders({ userId: session.user?.id });
        }

        return NextResponse.json({ orders, success: true });

    } catch (error) {
        console.error('GET /api/lunch/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        const data = await request.json();
        const { id } = data;

        if (!id) {
            return NextResponse.json(
                { error: '缺少訂單ID', success: false },
                { status: 400 }
            );
        }

        await orderService.deleteOrder(id);
        return NextResponse.json({
            message: '訂單已刪除',
            success: true
        });

    } catch (error) {
        console.error('DELETE /api/lunch/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to delete order', success: false },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        const data = await request.json();
        const { id, items, note } = data;

        if (!id) {
            return NextResponse.json(
                { error: '缺少訂單ID', success: false },
                { status: 400 }
            );
        }

        const order = await orderService.updateOrder(id, {
            items,
            note
        });

        return NextResponse.json({
            order,
            message: '訂單已更新',
            success: true
        });

    } catch (error) {
        console.error('PUT /api/lunch/orders error:', error);
        return NextResponse.json(
            { error: 'Failed to update order', success: false },
            { status: 500 }
        );
    }
}