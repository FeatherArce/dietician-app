import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/server/auth/request-utils';
import { orderService } from '@/services/server/lunch/order-services';
import { UserRole } from '@/prisma-generated/postgres-client';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json(
                { error: '未授權訪問', success: false }, 
                { status: 401 }
            );
        }

        const { orderId } = await params;
        const data = await request.json();
        const { is_paid, paid_at, paid_method, paid_note } = data;

        // 獲取訂單資訊以檢查權限
        const order = await orderService.getOrderById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: '訂單不存在', success: false }, 
                { status: 404 }
            );
        }

        // 檢查權限：只有活動擁有者可以修改收款狀態
        // TODO: 等資料庫遷移完成後，從 order.event 獲取 owner_id
        // if (event.owner_id !== session.userId && session.role !== 'ADMIN' && session.role !== 'MODERATOR') {
        //     return NextResponse.json(
        //         { error: '權限不足，只有活動擁有者可以修改收款狀態', success: false }, 
        //         { status: 403 }
        //     );
        // }

        // 暫時只允許管理者操作，等資料庫遷移完成後恢復權限檢查
        if (session.role !== UserRole.ADMIN && session.role !== UserRole.MODERATOR) {
            return NextResponse.json(
                { error: '權限不足', success: false }, 
                { status: 403 }
            );
        }

        // 更新收款狀態
        const updatedOrder = await orderService.updatePaymentStatus(orderId, {
            is_paid: Boolean(is_paid),
            paid_at: is_paid ? (paid_at ? new Date(paid_at) : new Date()) : null,
            paid_method: is_paid ? paid_method : null,
            paid_note: is_paid ? paid_note : null
        });

        return NextResponse.json({ 
            order: updatedOrder, 
            message: `收款狀態已更新為${is_paid ? '已收款' : '未收款'}`, 
            success: true 
        });

    } catch (error) {
        console.error('PATCH /api/lunch/orders/[orderId]/payment error:', error);
        return NextResponse.json(
            { error: 'Failed to update payment status', success: false }, 
            { status: 500 }
        );
    }
}