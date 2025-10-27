import { NextRequest, NextResponse } from 'next/server';
import { lunchEventService, type CreateLunchEventData, type LunchEventFilters } from '@/services/server/lunch/lunch-event-services';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        // 解析查詢參數
        const filters: LunchEventFilters = {};
        
        const isActiveParam = searchParams.get('is_active');
        if (isActiveParam !== null) {
            filters.isActive = isActiveParam === 'true';
        }
        
        const ownerIdParam = searchParams.get('owner_id');
        if (ownerIdParam) {
            filters.ownerId = ownerIdParam;
        }
        
        const dateFromParam = searchParams.get('date_from');
        if (dateFromParam) {
            filters.eventDateFrom = new Date(dateFromParam);
        }
        
        const dateToParam = searchParams.get('date_to');
        if (dateToParam) {
            filters.eventDateTo = new Date(dateToParam);
        }

        const events = await lunchEventService.getEvents(filters);
        return NextResponse.json({ events, success: true });
        
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
        if (!data.title || !data.event_date || !data.order_deadline || !data.owner_id) {
            console.log('Validation failed - missing required fields');
            return NextResponse.json(
                { error: '缺少必要欄位: title, event_date, order_deadline, owner_id', success: false }, 
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
            allow_custom_items: data.allow_custom_items ?? false
        };

        console.log('Creating event with data:', eventData);
        const event = await lunchEventService.createEvent(eventData);
        console.log('Event created successfully:', event);
        
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