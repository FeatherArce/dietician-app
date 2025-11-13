import { EventOrder, EventOrderItem } from '@/app/lunch/types';
import { UserRole } from '@/prisma-generated/postgres-client';
import { auth } from "@/libs/auth";
import { LunchEventFilters, lunchEventService } from '@/services/server/lunch/lunch-event-services';
import { NextRequest, NextResponse } from 'next/server';
import { getEventDetails, getEventRequestFilters } from '../utils';
import { GetEventResponse } from '@/types/api/lunch';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const filters: LunchEventFilters = getEventRequestFilters(request);
        const event = await lunchEventService.getEventById(id, filters);

        if (!event) {
            return NextResponse.json(
                { error: '事件不存在', success: false },
                { status: 404 }
            );
        }

        // 添加統計資料到事件物件
        const newEventWithOrders = getEventDetails(event);
        const response: GetEventResponse = {
            success: true,
            data: {
                event: newEventWithOrders
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        const resolvedParams = await params;
        console.error(`GET /api/lunch/events/${resolvedParams.id} error:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch event', success: false },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 驗證用戶身份
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        // 獲取事件資料以檢查權限
        const existingEvent = await lunchEventService.getEventById(id);
        if (!existingEvent) {
            return NextResponse.json(
                { error: '找不到該事件', success: false },
                { status: 404 }
            );
        }

        const isOwner = existingEvent.owner_id === session?.user?.id;
        const isAdmin = session?.user?.role === UserRole.ADMIN;
        const isModerator = session?.user?.role === UserRole.MODERATOR;

        if (!isOwner && !isAdmin && !isModerator) {
            return NextResponse.json(
                { error: '權限不足，只有事件擁有者或管理者可以編輯此事件', success: false },
                { status: 403 }
            );
        }

        const data = await request.json();

        // 轉換日期欄位
        if (data.event_date) {
            data.event_date = new Date(data.event_date);
        }
        if (data.order_deadline) {
            data.order_deadline = new Date(data.order_deadline);
        }
        if (data.start_at) {
            data.start_at = new Date(data.start_at);
        }
        if (data.end_at) {
            data.end_at = new Date(data.end_at);
        }

        // 處理空的 shop_id
        if (data.shop_id === '') {
            data.shop_id = null;
        }

        const event = await lunchEventService.updateEvent(id, data);
        return NextResponse.json({
            event,
            message: '事件已更新',
            success: true
        });

    } catch (error) {
        const resolvedParams = await params;
        console.error(`PUT /api/lunch/events/${resolvedParams.id} error:`, error);
        return NextResponse.json(
            { error: 'Failed to update event', success: false },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 驗證用戶身份
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        // 獲取事件資料以檢查權限
        const existingEvent = await lunchEventService.getEventById(id);
        if (!existingEvent) {
            return NextResponse.json(
                { error: '找不到該事件', success: false },
                { status: 404 }
            );
        }

        // 權限檢查：事件擁有者、管理員或系統管理員
        const isOwner = existingEvent.owner_id === session?.user?.id;
        const isAdmin = session?.user?.role === UserRole.ADMIN;
        const isModerator = session?.user?.role === UserRole.MODERATOR;

        if (!isOwner && !isAdmin && !isModerator) {
            return NextResponse.json(
                { error: '權限不足，只有事件擁有者或管理員可以修改此事件', success: false },
                { status: 403 }
            );
        }

        const data = await request.json();

        // 轉換日期欄位
        if (data.event_date) {
            data.event_date = new Date(data.event_date);
        }
        if (data.order_deadline) {
            data.order_deadline = new Date(data.order_deadline);
        }
        if (data.start_at) {
            data.start_at = new Date(data.start_at);
        }
        if (data.end_at) {
            data.end_at = new Date(data.end_at);
        }

        // 處理空的 shop_id
        if (data.shop_id === '') {
            data.shop_id = null;
        }

        const event = await lunchEventService.updateEvent(id, data);
        return NextResponse.json({
            event,
            message: '事件已更新',
            success: true
        });
    } catch (error) {
        const resolvedParams = await params;
        console.error(`PUT /api/lunch/events/${resolvedParams.id} error:`, error);

        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { message, success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 驗證用戶身份
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: '未授權訪問', success: false },
                { status: 401 }
            );
        }

        // 獲取事件資料以檢查權限
        const existingEvent = await lunchEventService.getEventById(id);
        if (!existingEvent) {
            return NextResponse.json(
                { error: '找不到該事件', success: false },
                { status: 404 }
            );
        }

        // 權限檢查：事件擁有者、管理員或系統管理員
        const isOwner = existingEvent.owner_id === session?.user?.id;
        const isAdmin = session?.user?.role === UserRole.ADMIN;
        const isModerator = session?.user?.role === UserRole.MODERATOR;

        if (!isOwner && !isAdmin && !isModerator) {
            return NextResponse.json(
                { error: '權限不足，只有事件擁有者或管理者可以刪除此事件', success: false },
                { status: 403 }
            );
        }

        const event = await lunchEventService.deleteEvent(id);

        return NextResponse.json({
            event,
            message: '事件已刪除',
            success: true
        });

    } catch (error) {
        const resolvedParams = await params;
        console.error(`DELETE /api/lunch/events/${resolvedParams.id} error:`, error);
        return NextResponse.json(
            { error: 'Failed to delete event', success: false },
            { status: 500 }
        );
    }
}