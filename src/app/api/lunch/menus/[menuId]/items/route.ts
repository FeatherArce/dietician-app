import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth";
import { menuItemService } from '@/services/server/lunch/shop-services';

// GET /api/lunch/menus/[menuId]/items - 獲取菜單的所有項目
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
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id') || undefined;

    const items = await menuItemService.getItems(menuId, categoryId);

    return NextResponse.json({
      success: true,
      items
    });

  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json(
      { error: '獲取項目失敗' },
      { status: 500 }
    );
  }
}

// POST /api/lunch/menus/[menuId]/items - 為菜單建立新項目
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
    const { 
      name, 
      description, 
      price, 
      category_id, 
      is_available = true, 
      sort_order = 0,
      image_url 
    } = await request.json();

    // 驗證必填欄位
    if (!name?.trim()) {
      return NextResponse.json({ error: '項目名稱為必填' }, { status: 400 });
    }

    if (price === undefined || price < 0) {
      return NextResponse.json({ error: '價格必須為正數或零' }, { status: 400 });
    }

    // 建立項目
    const item = await menuItemService.createItem({
      name: name.trim(),
      description: description?.trim() || undefined,
      price: parseFloat(price),
      menu_id: menuId,
      category_id: category_id || undefined,
      is_available,
      sort_order,
      image_url: image_url?.trim() || undefined
    });

    return NextResponse.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json(
      { error: '建立項目失敗' },
      { status: 500 }
    );
  }
}