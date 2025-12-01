import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import postgresClient from '@/services/prisma';

// GET /api/lunch/shops/[id]/menus/[menuId] - 獲取特定菜單
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: shopId, menuId } = await params;
    if (!shopId || !menuId) {
      return NextResponse.json({ error: '缺少商店ID或菜單ID' }, { status: 400 });
    }

    const menu = await postgresClient.menu.findFirst({
      where: {
        id: menuId,
        shop_id: shopId
      },
      include: {
        categories: {
          include: {
            items: {
              orderBy: { created_at: 'asc' }
            }
          },
          orderBy: { created_at: 'asc' }
        },
        items: true,
        _count: {
          select: { categories: true, items: true }
        }
      }
    });

    if (!menu) {
      return NextResponse.json({ error: '菜單不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      menu
    });

  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return NextResponse.json(
      { error: '獲取菜單失敗' },
      { status: 500 }
    );
  }
}

// PATCH /api/lunch/shops/[id]/menus/[menuId] - 更新菜單
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: shopId, menuId } = await params;
    const updateData = await request.json();

    // 檢查菜單是否存在
    const existingMenu = await postgresClient.menu.findFirst({
      where: {
        id: menuId,
        shop_id: shopId
      }
    });

    if (!existingMenu) {
      return NextResponse.json({ error: '菜單不存在' }, { status: 404 });
    }

    // 準備更新資料
    const dataToUpdate: Partial<{
      name: string;
      description: string | null;
      is_available: boolean;
    }> = {};
    if (updateData.name !== undefined) {
      dataToUpdate.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description?.trim() || null;
    }
    if (updateData.is_available !== undefined) {
      dataToUpdate.is_available = updateData.is_available;
    }

    const menu = await postgresClient.menu.update({
      where: { id: menuId },
      data: dataToUpdate,
      include: {
        categories: {
          include: {
            items: true
          }
        },
        _count: {
          select: { categories: true, items: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      menu
    });

  } catch (error) {
    console.error('Failed to update menu:', error);
    return NextResponse.json(
      { error: '更新菜單失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/lunch/shops/[id]/menus/[menuId] - 刪除菜單
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: shopId, menuId } = await params;

    // 檢查菜單是否存在
    const existingMenu = await postgresClient.menu.findFirst({
      where: {
        id: menuId,
        shop_id: shopId
      }
    });

    if (!existingMenu) {
      return NextResponse.json({ error: '菜單不存在' }, { status: 404 });
    }

    // 刪除菜單（會自動級聯刪除分類和項目）
    const deletedItem = await postgresClient.menu.delete({
      where: { id: menuId }
    });

    return NextResponse.json({
      success: true,
      message: '菜單已刪除'
    });

  } catch (error) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json(
      { error: '刪除菜單失敗' },
      { status: 500 }
    );
  }
}