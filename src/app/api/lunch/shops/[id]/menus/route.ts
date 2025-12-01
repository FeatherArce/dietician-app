import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/libs/auth"; 
import postgresClient from '@/libs/prisma';

// GET /api/lunch/shops/[id]/menus - 獲取商店的所有菜單
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: shopId } = await params;

    const menus = await postgresClient.menu.findMany({
      where: {
        shop_id: shopId
      },
      include: {
        categories: {
          include: {
            items: true,
            _count: {
              select: { items: true }
            }
          }
        },
        _count: {
          select: { categories: true, items: true }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      menus
    });

  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return NextResponse.json(
      { error: '獲取菜單失敗' },
      { status: 500 }
    );
  }
}

// POST /api/lunch/shops/[id]/menus - 為商店建立新菜單
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: shopId } = await params;
    const { name, description, is_available = true } = await request.json();

    // 驗證必填欄位
    if (!name?.trim()) {
      return NextResponse.json({ error: '菜單名稱為必填' }, { status: 400 });
    }

    // 檢查商店是否存在
    const shop = await postgresClient.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return NextResponse.json({ error: '商店不存在' }, { status: 404 });
    }

    // 建立菜單
    const menu = await postgresClient.menu.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        is_available,
        shop_id: shopId
      },
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
    console.error('Failed to create menu:', error);
    return NextResponse.json(
      { error: '建立菜單失敗' },
      { status: 500 }
    );
  }
}