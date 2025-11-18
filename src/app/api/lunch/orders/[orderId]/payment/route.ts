import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import { orderService } from "@/services/server/lunch/order-services";
import { UserRole } from "@/prisma-generated/postgres-client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授權訪問", success: false },
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
        { error: "訂單不存在", success: false },
        { status: 404 }
      );
    }

    // 檢查權限：只有活動擁有者可以修改收款狀態
    if (
      session?.user?.role !== UserRole.ADMIN &&
      session?.user?.role !== UserRole.MODERATOR &&
      order.event.owner_id !== session.user.id
    ) {
      return NextResponse.json(
        { error: "權限不足", success: false },
        { status: 403 }
      );
    }

    // 更新收款狀態
    const updatedOrder = await orderService.updatePaymentStatus(orderId, {
      is_paid: Boolean(is_paid),
      paid_at: is_paid ? (paid_at ? new Date(paid_at) : new Date()) : null,
      paid_method: is_paid ? paid_method : null,
      paid_note: is_paid ? paid_note : null,
    });

    return NextResponse.json({
      order: updatedOrder,
      message: `收款狀態已更新為${is_paid ? "已收款" : "未收款"}`,
      success: true,
    });
  } catch (error) {
    console.error("PATCH /api/lunch/orders/[orderId]/payment error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status", success: false },
      { status: 500 }
    );
  }
}
