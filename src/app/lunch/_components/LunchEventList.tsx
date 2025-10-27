'use client';
import { LunchEvent } from '@/prisma-generated/postgres-client';
import swrFetcher from '@/services/swrFetcher';
import React, { useCallback } from 'react'
import useSWR from 'swr';
import AddEventButton from './AddEventButton';
import LunchEventListItem from './LunchEventListItem';

export default function LunchEventList({
    title,
    initialData = [],
}: {
    title?: string;
    initialData?: LunchEvent[];
}) {
    const user = { id: 'user-1', name: 'User 1', role: 'organizer' }; // Mocked user data
    const { data: events, error, mutate } = useSWR('/api/lunch/events', swrFetcher, {
        fallbackData: initialData, // 使用 Server 預載的資料作為初始值
    });

    const handleAddEvent = useCallback(async () => {
        const newEvent = {
            title: 'New Event',
            description: 'Event Description',
            date: new Date().toISOString(),
            owner_id: user.id,
        };
        
        try {
            const response = await fetch('/api/lunch/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to add event');
            }
            
            // 重新驗證資料
            mutate();
        } catch (error) {
            console.error('Failed to add event:', error);
            alert('新增事件失敗：' + (error as Error).message);
        }
    }, [user.id, mutate]);

    const handleUpdateEvent = useCallback(async (id: string, updates: Partial<LunchEvent>) => {
        try {
            const response = await fetch(`/api/lunch/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update event');
            }
            
            // 重新驗證資料
            mutate();
        } catch (error) {
            console.error('Failed to update event:', error);
            alert('更新事件失敗：' + (error as Error).message);
        }
    }, [mutate]);

    const handleOrderEvent = useCallback(async (id: string) => {
        console.log('Order event:', id);
        // TODO: 實作訂餐邏輯，開啟新增視窗
    }, []);

    const handleEditEvent = useCallback(async (id: string,) => {
        console.log('Edit event:', id);
        // TODO: 實作編輯邏輯，開啟編輯視窗
    }, []);

    const handleDeleteEvent = useCallback(async (id: string) => {
        if (!confirm('確定要刪除這個訂餐事件嗎？')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/lunch/events/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to delete event');
            }
            
            // 重新驗證資料
            mutate();
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('刪除事件失敗：' + (error as Error).message);
        }
    }, [mutate]);

    if (error) return <div>Error loading events</div>;

    return (
        <div className="w-full">
            <AddEventButton onAdd={handleAddEvent} />
            {/* 事件列表 */}
            <ul className="list bg-base-100 rounded-box shadow-md">
                {title && <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{title}</li>}
                {events?.map((event: LunchEvent) => (
                    <LunchEventListItem
                        key={event.id}
                        event={event}
                        currentUserId={user.id}
                        onDelete={handleDeleteEvent}
                        onEdit={handleEditEvent}
                        onOrder={handleOrderEvent}
                    />
                ))}
            </ul>
        </div>
    )
}
