import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import { menuCategoryService } from '@/services/lunch/shop-services';

// PATCH /api/lunch/menus/[menuId]/categories/[categoryId] - 更新分類
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { categoryId } = await params;
    const updateData = await request.json();

    // 驗證必填欄位
    if (updateData.name !== undefined && !updateData.name?.trim()) {
      return NextResponse.json({ error: '分類名稱為必填' }, { status: 400 });
    }

    // 準備更新資料
    const dataToUpdate: Record<string, unknown> = {};
    if (updateData.name !== undefined) {
      dataToUpdate.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description?.trim() || null;
    }
    if (updateData.sort_order !== undefined) {
      dataToUpdate.sort_order = updateData.sort_order;
    }
    if (updateData.is_active !== undefined) {
      dataToUpdate.is_active = updateData.is_active;
    }

    const category = await menuCategoryService.updateCategory(categoryId, dataToUpdate);

    return NextResponse.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json(
      { error: '更新分類失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/lunch/menus/[menuId]/categories/[categoryId] - 刪除分類
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { categoryId } = await params;

    await menuCategoryService.deleteCategory(categoryId);

    return NextResponse.json({
      success: true,
      message: '分類已刪除'
    });

  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      { error: '刪除分類失敗' },
      { status: 500 }
    );
  }
}