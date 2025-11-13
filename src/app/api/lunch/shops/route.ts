import { menuService, shopService, type CreateShopData, type ShopFilters } from '@/services/server/lunch/shop-services';
import { GetShopsResponse } from '@/types/api/lunch';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // 解析查詢參數
        const filters: ShopFilters = {};

        const isActiveParam = searchParams.get('is_active');
        if (isActiveParam !== null) {
            filters.isActive = isActiveParam === 'true';
        }

        const searchNameParam = searchParams.get('search_name');
        if (searchNameParam) {
            filters.searchName = searchNameParam;
        }

        const shops = await shopService.getShops(filters);
        const response: GetShopsResponse = {
            success: true,
            data: { shops }
        };
        return NextResponse.json(response);

    } catch (error) {
        console.error('GET /api/lunch/shops error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch shops', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // 驗證必要欄位
        if (!data.name) {
            return NextResponse.json(
                { message: '缺少必要欄位: name', success: false },
                { status: 400 }
            );
        }

        const shopData: CreateShopData = {
            name: data.name,
            description: data.description,
            address: data.address,
            phone: data.phone,
            email: data.email,
            website: data.website,
            is_active: data.is_active ?? true
        };

        const shop = await shopService.createShop(shopData);
        const defaultMenu = await menuService.createMenu({
            shop_id: shop.id,
            name: '預設菜單',
            description: '這是商店的預設菜單',
            is_available: true,
            is_default: true
        });
        return NextResponse.json({
            shop,
            defaultMenu,
            message: '商店已新增',
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('POST /api/lunch/shops error:', error);
        return NextResponse.json(
            { message: 'Failed to create shop', success: false },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { message: '缺少商店ID', success: false },
                { status: 400 }
            );
        }

        const { id, ...updateData } = data;

        const shop = await shopService.updateShop(id, updateData);
        return NextResponse.json({
            shop,
            message: '商店已更新',
            success: true
        });

    } catch (error) {
        console.error('PUT /api/lunch/shops error:', error);
        return NextResponse.json(
            { message: 'Failed to update shop', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { message: '缺少商店ID', success: false },
                { status: 400 }
            );
        }

        const shop = await shopService.deleteShop(data.id);
        return NextResponse.json({
            shop,
            message: '商店已刪除',
            success: true
        });

    } catch (error) {
        console.error('DELETE /api/lunch/shops error:', error);
        return NextResponse.json(
            { message: 'Failed to delete shop', success: false },
            { status: 500 }
        );
    }
}