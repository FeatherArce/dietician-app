// /api/lunch/shops/[id]/menus/[menuId]/items/batch
// batch add menu items api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import { CreateMenuItemData, menuItemService } from "@/services/lunch";
import { PostBatchShopMenuItemsResponse } from "@/types/api/lunch";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; menuId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }
        const { id: shopId, menuId } = await params;
        const data = await request.json();
        console.log('Received batch create menu items data:', data);
        const itemsData = data; // 原始資料只會有 name, description, price, is_available
        const newItems: CreateMenuItemData[] = itemsData.map((item: any) => ({
            menu_id: menuId,
            name: item.name?.trim(),
            description: item.description?.trim() || undefined,
            price: parseFloat(item.price),
            is_available: item.is_available,
        }));
        const batchCreateResult = await menuItemService.batchCreateMenuItems(newItems);
        const response: PostBatchShopMenuItemsResponse = {
            success: true,
            message: "已完成批次新增菜單項目",
            data: {
                count: batchCreateResult.count
            }
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to batch create menu items:', error);
        return NextResponse.json(
            { error: '批次新增菜單項目失敗' },
            { status: 500 }
        );
    }
}