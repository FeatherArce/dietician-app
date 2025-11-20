import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import { orderService } from "@/services/server/lunch/order-services";
import { ApiMessage } from "../../../utils";
import { DeleteOrderResponse } from "@/types/api/lunch";

// 獲取訂單列表
export async function GET(
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
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "訂單不存在", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { order }, success: true });
  } catch (error) {
    console.error("GET /api/lunch/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!orderId) {
      return NextResponse.json(
        { error: "缺少訂單ID", success: false },
        { status: 400 }
      );
    }

    const deletedOrder = await orderService.deleteOrder(orderId);
    const response: DeleteOrderResponse = {
      data: { orderId, order: deletedOrder },
      message: "訂單已刪除",
      success: true,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("DELETE /api/lunch/orders error:", error);
    return NextResponse.json(
      { error: error, message: "Failed to delete order", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授權訪問", success: false },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, items, note } = data;

    if (!id) {
      return NextResponse.json(
        { error: "缺少訂單ID", success: false },
        { status: 400 }
      );
    }

    const order = await orderService.updateOrder(id, {
      items,
      note,
    });

    return NextResponse.json({
      order,
      message: "訂單已更新",
      success: true,
    });
  } catch (error) {
    console.error("PUT /api/lunch/orders error:", error);
    return NextResponse.json(
      { error: "Failed to update order", success: false },
      { status: 500 }
    );
  }
}
