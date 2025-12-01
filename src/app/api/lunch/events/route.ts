import { checkRequiredFields } from '@/libs/utils';
import { lunchEventService, type CreateLunchEventData, type LunchEventFilters } from '@/services/lunch/lunch-event-services';
import { NextRequest, NextResponse } from 'next/server';
import { getEventDetails, getEventRequestFilters } from './utils';
import { ILunchEvent } from '@/types/LunchEvent';

export async function GET(request: NextRequest) {
    try {
        // 解析查詢參數
        const filters: LunchEventFilters = getEventRequestFilters(request);

        const events = await lunchEventService.getEvents(filters);
        const newEvents: Array<ILunchEvent> = [];
        for (const event of events) {
            const newEvent = getEventDetails(event);
            newEvents.push(newEvent);
        }

        return NextResponse.json({ events: newEvents, success: true });
    } catch (error) {
        console.error('GET /api/lunch/events error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('POST /api/lunch/events - Starting');
        const data = await request.json();
        console.log('Request data received:', data);

        // 驗證必要欄位
        const missingFields = checkRequiredFields(data, ['title', 'event_date', 'order_deadline', 'owner_id']);
        if (missingFields.length > 0) {
            console.log('Validation failed - missing fields:', missingFields);
            return NextResponse.json(
                { error: `缺少必要欄位: ${missingFields.join(', ')}`, success: false },
                { status: 400 }
            );
        }

        const eventData: CreateLunchEventData = {
            title: data.title,
            description: data.description,
            event_date: new Date(data.event_date),
            order_deadline: new Date(data.order_deadline),
            start_at: data.start_at ? new Date(data.start_at) : undefined,
            end_at: data.end_at ? new Date(data.end_at) : undefined,
            location: data.location,
            is_active: data.is_active ?? true,
            owner_id: data.owner_id,
            shop_id: data.shop_id && data.shop_id.trim() !== '' ? data.shop_id : undefined,
            allow_custom_items: data.allow_custom_items ?? false,
        };

        const event = await lunchEventService.createEvent(eventData);

        return NextResponse.json({
            event,
            message: '事件已新增',
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('POST /api/lunch/events error:', error);
        return NextResponse.json(
            { error: 'Failed to create event', success: false },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: '缺少事件ID', success: false },
                { status: 400 }
            );
        }

        const { id, ...updateData } = data;

        // 轉換日期欄位
        if (updateData.event_date) {
            updateData.event_date = new Date(updateData.event_date);
        }
        if (updateData.order_deadline) {
            updateData.order_deadline = new Date(updateData.order_deadline);
        }
        if (updateData.start_at) {
            updateData.start_at = new Date(updateData.start_at);
        }
        if (updateData.end_at) {
            updateData.end_at = new Date(updateData.end_at);
        }

        const event = await lunchEventService.updateEvent(id, updateData);
        return NextResponse.json({
            event,
            message: '事件已更新',
            success: true
        });

    } catch (error) {
        console.error('PUT /api/lunch/events error:', error);
        return NextResponse.json(
            { error: 'Failed to update event', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { error: '缺少事件ID', success: false },
                { status: 400 }
            );
        }

        const event = await lunchEventService.deleteEvent(data.id);
        return NextResponse.json({
            event,
            message: '事件已刪除',
            success: true
        });

    } catch (error) {
        console.error('DELETE /api/lunch/events error:', error);
        return NextResponse.json(
            { error: 'Failed to delete event', success: false },
            { status: 500 }
        );
    }
}