import { NextRequest, NextResponse } from 'next/server';
import { shopService } from '@/services/server/lunch/shop-services';

export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: shopId } = await params;

        const shop = await shopService.getShopById(shopId);
        
        if (!shop) {
            return NextResponse.json(
                { error: '找不到商店', success: false }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ shop, success: true });
        
    } catch (error) {
        const { id: shopId } = await params;
        console.error(`GET /api/lunch/shops/${shopId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch shop', success: false }, 
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: shopId } = await params;
        const data = await request.json();

        const shop = await shopService.updateShop(shopId, data);
        return NextResponse.json({ 
            shop, 
            message: '商店已更新', 
            success: true 
        });
        
    } catch (error) {
        const { id: shopId } = await params;
        console.error(`PATCH /api/lunch/shops/${shopId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to update shop', success: false }, 
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: shopId } = await params;

        const shop = await shopService.deleteShop(shopId);
        return NextResponse.json({ 
            shop, 
            message: '商店已刪除', 
            success: true 
        });
        
    } catch (error) {
        const { id: shopId } = await params;
        console.error(`DELETE /api/lunch/shops/${shopId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to delete shop', success: false }, 
            { status: 500 }
        );
    }
}