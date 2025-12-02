import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import { menuCategoryService } from '@/services/lunch/shop-services';

// GET /api/lunch/shops/[id]/menus/[menuId]/categories - 獲取菜單的所有分類
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { menuId } = await params;

    const categories = await menuCategoryService.getCategories(menuId);

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: '獲取分類失敗' },
      { status: 500 }
    );
  }
}

// POST /api/lunch/shops/[id]/menus/[menuId]/categories - 為菜單建立新分類
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { menuId } = await params;
    const { name, description, sort_order = 0, is_active = true } = await request.json();

    // 驗證必填欄位
    if (!name?.trim()) {
      return NextResponse.json({ error: '分類名稱為必填' }, { status: 400 });
    }

    // 建立分類
    const category = await menuCategoryService.createCategory({
      name: name.trim(),
      description: description?.trim() || undefined,
      menu_id: menuId,
      sort_order,
      is_active
    });

    return NextResponse.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { error: '建立分類失敗' },
      { status: 500 }
    );
  }
}