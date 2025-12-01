import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import { menuItemService } from '@/services/server/lunch/shop-services';
import { DeleteShopMenuItemResponse } from '@/types/api/lunch';

// PATCH /api/lunch/menus/[menuId]/items/[itemId] - 更新項目
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { itemId } = await params;
    const updateData = await request.json();

    // 驗證必填欄位
    if (updateData.name !== undefined && !updateData.name?.trim()) {
      return NextResponse.json({ error: '項目名稱為必填' }, { status: 400 });
    }

    if (updateData.price !== undefined && updateData.price < 0) {
      return NextResponse.json({ error: '價格不能為負數' }, { status: 400 });
    }

    // 準備更新資料
    const dataToUpdate: Record<string, unknown> = {};
    if (updateData.name !== undefined) {
      dataToUpdate.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description?.trim() || null;
    }
    if (updateData.price !== undefined) {
      dataToUpdate.price = parseFloat(updateData.price);
    }
    if (updateData.category_id !== undefined) {
      dataToUpdate.category_id = updateData.category_id || null;
    }
    if (updateData.is_available !== undefined) {
      dataToUpdate.is_available = updateData.is_available;
    }
    if (updateData.sort_order !== undefined) {
      dataToUpdate.sort_order = updateData.sort_order;
    }
    if (updateData.image_url !== undefined) {
      dataToUpdate.image_url = updateData.image_url?.trim() || null;
    }

    const item = await menuItemService.updateItem(itemId, dataToUpdate);

    return NextResponse.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json(
      { error: '更新項目失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/lunch/menus/[menuId]/items/[itemId] - 刪除項目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { itemId } = await params;

    const res = await menuItemService.deleteItem(itemId);
    const response: DeleteShopMenuItemResponse = {
      success: true,
      message: '項目已刪除',
      data: {
        id: itemId,
        item: res
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json(
      { error: '刪除項目失敗' },
      { status: 500 }
    );
  }
}