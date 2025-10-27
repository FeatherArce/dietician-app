# Lunch System API 設計指南

## 概述

本文檔說明如何在 Next.js 15 App Router 中使用 Service Layer 建立 API Routes。

## API 架構設計

### 設計原則
- ✅ **薄 API 層**：API Route 只處理 HTTP 相關邏輯
- ✅ **厚 Service 層**：所有商業邏輯都在 Service Layer
- ✅ **統一回應格式**：一致的成功和錯誤回應結構
- ✅ **權限驗證**：在 API 層進行身份驗證，Service 層進行權限檢查
- ✅ **類型安全**：完整的 TypeScript 類型定義

### 回應格式標準

#### 成功回應
```typescript
{
    success: true,
    data: any,           // 實際資料
    message?: string,    // 可選的成功訊息
    meta?: {            // 可選的元資料
        total?: number,
        page?: number,
        limit?: number
    }
}
```

#### 錯誤回應
```typescript
{
    success: false,
    error: string,       // 錯誤訊息
    code?: string,       // 錯誤代碼
    details?: any        // 詳細錯誤資訊
}
```

## API Routes 實作範例

### 1. Event Management APIs

#### `app/api/lunch/events/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { lunchEventService, type CreateLunchEventData, type LunchEventFilters } from '@/services/lunch';
// import { getServerSession } from 'next-auth'; // 未來加入

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
        
        const allowCustomItemsParam = searchParams.get('allow_custom_items');
        if (allowCustomItemsParam !== null) {
            filters.allowCustomItems = allowCustomItemsParam === 'true';
        }

        const events = await lunchEventService.getEvents(filters);
        
        return NextResponse.json({ 
            success: true, 
            data: events,
            meta: { total: events.length }
        });
        
    } catch (error) {
        console.error('GET /api/lunch/events error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch events'
            }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // TODO: 身份驗證
        // const session = await getServerSession(authOptions);
        // if (!session) {
        //     return NextResponse.json(
        //         { success: false, error: '請先登入' }, 
        //         { status: 401 }
        //     );
        // }

        const data = await request.json();
        
        // 基本驗證
        if (!data.title || !data.event_date || !data.order_deadline) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: '缺少必要欄位: title, event_date, order_deadline' 
                }, 
                { status: 400 }
            );
        }

        // 暫時使用模擬的 user ID，未來從 session 獲取
        const eventData: CreateLunchEventData = {
            title: data.title,
            description: data.description,
            event_date: new Date(data.event_date),
            order_deadline: new Date(data.order_deadline),
            start_at: data.start_at ? new Date(data.start_at) : undefined,
            end_at: data.end_at ? new Date(data.end_at) : undefined,
            location: data.location,
            is_active: data.is_active ?? true,
            owner_id: data.owner_id, // TODO: 從 session 獲取
            shop_id: data.shop_id,
            allow_custom_items: data.allow_custom_items ?? false
        };

        const event = await lunchEventService.createEvent(eventData);
        
        return NextResponse.json({ 
            success: true,
            data: event,
            message: '事件已成功建立'
        }, { status: 201 });
        
    } catch (error) {
        console.error('POST /api/lunch/events error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create event'
            }, 
            { status: 500 }
        );
    }
}
```

#### `app/api/lunch/events/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { lunchEventService, userService } from '@/services/lunch';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = params;
        const event = await lunchEventService.getEventById(id);
        
        if (!event) {
            return NextResponse.json(
                { success: false, error: '事件不存在' }, 
                { status: 404 }
            );
        }
        
        return NextResponse.json({ 
            success: true, 
            data: event 
        });
        
    } catch (error) {
        console.error(`GET /api/lunch/events/${params.id} error:`, error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch event'
            }, 
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = params;
        const data = await request.json();
        
        // TODO: 身份驗證和權限檢查
        // const session = await getServerSession(authOptions);
        // const userId = session?.user?.id;
        // const isOwner = await userService.isEventOwner(userId, id);
        // const hasPermission = await userService.checkUserPermission(userId, UserRole.MODERATOR);
        
        // if (!isOwner && !hasPermission) {
        //     return NextResponse.json(
        //         { success: false, error: '權限不足' }, 
        //         { status: 403 }
        //     );
        // }
        
        // 轉換日期欄位
        const updateData = { ...data };
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
            success: true,
            data: event,
            message: '事件已更新'
        });
        
    } catch (error) {
        console.error(`PUT /api/lunch/events/${params.id} error:`, error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to update event'
            }, 
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = params;
        
        // TODO: 權限檢查
        
        await lunchEventService.deleteEvent(id);
        
        return NextResponse.json({ 
            success: true,
            message: '事件已刪除'
        });
        
    } catch (error) {
        console.error(`DELETE /api/lunch/events/${params.id} error:`, error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to delete event'
            }, 
            { status: 500 }
        );
    }
}
```

### 2. Order Management APIs

#### `app/api/lunch/orders/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { orderService, type CreateOrderData } from '@/services/lunch';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        const filters = {
            userId: searchParams.get('user_id') || undefined,
            eventId: searchParams.get('event_id') || undefined,
        };

        const orders = await orderService.getOrders(filters);
        
        return NextResponse.json({ 
            success: true, 
            data: orders 
        });
        
    } catch (error) {
        console.error('GET /api/lunch/orders error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        
        // 驗證必要欄位
        if (!data.user_id || !data.event_id || !data.items || data.items.length === 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: '缺少必要欄位: user_id, event_id, items' 
                }, 
                { status: 400 }
            );
        }

        // 驗證項目格式
        for (const item of data.items) {
            if (!item.name || typeof item.price !== 'number') {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: '項目必須包含 name 和 price' 
                    }, 
                    { status: 400 }
                );
            }
        }

        const orderData: CreateOrderData = {
            user_id: data.user_id,
            event_id: data.event_id,
            note: data.note,
            items: data.items
        };

        const order = await orderService.createOrder(orderData);
        
        return NextResponse.json({ 
            success: true,
            data: order,
            message: '訂單已建立'
        }, { status: 201 });
        
    } catch (error) {
        console.error('POST /api/lunch/orders error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create order'
            }, 
            { status: 500 }
        );
    }
}
```

### 3. Shop Management APIs

#### `app/api/lunch/shops/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { shopService, userService, UserRole } from '@/services/lunch';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        const filters = {
            isActive: searchParams.get('is_active') === 'true',
            searchName: searchParams.get('search') || undefined
        };

        const shops = await shopService.getShops(filters);
        
        return NextResponse.json({ 
            success: true, 
            data: shops 
        });
        
    } catch (error) {
        console.error('GET /api/lunch/shops error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch shops' }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // TODO: 權限檢查 - 只有 ADMIN 可以建立商店
        // const session = await getServerSession(authOptions);
        // const hasPermission = await userService.checkUserPermission(
        //     session?.user?.id, 
        //     UserRole.ADMIN
        // );
        
        // if (!hasPermission) {
        //     return NextResponse.json(
        //         { success: false, error: '權限不足，只有管理員可以建立商店' }, 
        //         { status: 403 }
        //     );
        // }

        const data = await request.json();
        
        if (!data.name) {
            return NextResponse.json(
                { success: false, error: '商店名稱為必填欄位' }, 
                { status: 400 }
            );
        }

        const shop = await shopService.createShop(data);
        
        return NextResponse.json({ 
            success: true,
            data: shop,
            message: '商店已建立'
        }, { status: 201 });
        
    } catch (error) {
        console.error('POST /api/lunch/shops error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create shop'
            }, 
            { status: 500 }
        );
    }
}
```

## 前端整合

### SWR Fetcher 更新

更新 `services/swrFetcher.ts` 以處理新的 API 格式：

```typescript
export default async function swrFetcher(...args: Parameters<typeof fetch>) {
    const res = await fetch(...args);
    
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // 檢查 API 回應格式
    if ('success' in data) {
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        return data.data; // 回傳實際資料
    }
    
    // 向後相容舊格式
    return data;
}
```

### React Component 使用範例

```typescript
// app/lunch/_components/LunchEventList.tsx
import { lunchEventService } from '@/services/lunch';
import useSWR from 'swr';

export default function LunchEventList({ initialData = [] }) {
    const { data: events, error, mutate } = useSWR(
        '/api/lunch/events?is_active=true', 
        swrFetcher,
        { fallbackData: initialData }
    );

    const handleCreateEvent = async (eventData) => {
        try {
            const response = await fetch('/api/lunch/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // 重新驗證資料
            mutate();
            
            // 顯示成功訊息
            if (result.message) {
                alert(result.message);
            }
        } catch (error) {
            alert('建立事件失敗：' + error.message);
        }
    };

    return (
        <div>
            {/* UI 組件 */}
        </div>
    );
}
```

## 錯誤處理最佳實踐

### 1. API Route 錯誤處理
```typescript
export async function POST(request: NextRequest) {
    try {
        // 業務邏輯
    } catch (error) {
        console.error('API Error:', error);
        
        // 區分不同類型的錯誤
        if (error instanceof ValidationError) {
            return NextResponse.json(
                { success: false, error: error.message, code: 'VALIDATION_ERROR' }, 
                { status: 400 }
            );
        }
        
        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { success: false, error: 'Authentication required', code: 'AUTH_ERROR' }, 
                { status: 401 }
            );
        }
        
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { success: false, error: 'Insufficient permissions', code: 'PERMISSION_ERROR' }, 
                { status: 403 }
            );
        }
        
        // 預設錯誤
        return NextResponse.json(
            { success: false, error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
```

### 2. 前端錯誤處理
```typescript
const handleApiCall = async () => {
    try {
        const response = await fetch('/api/lunch/events', { ... });
        const result = await response.json();
        
        if (!result.success) {
            // 根據錯誤代碼處理不同情況
            switch (result.code) {
                case 'VALIDATION_ERROR':
                    setFieldErrors(result.details);
                    break;
                case 'AUTH_ERROR':
                    router.push('/login');
                    break;
                case 'PERMISSION_ERROR':
                    alert('權限不足');
                    break;
                default:
                    alert('操作失敗：' + result.error);
            }
            return;
        }
        
        // 成功處理
        setData(result.data);
        if (result.message) {
            showSuccessMessage(result.message);
        }
    } catch (error) {
        alert('網路錯誤：' + error.message);
    }
};
```

## 部署注意事項

1. **環境變數**：確保 `DATABASE_URL` 正確設定
2. **Prisma 生成**：部署前執行 `prisma generate`
3. **資料庫遷移**：執行 `prisma migrate deploy`
4. **錯誤監控**：考慮加入 Sentry 等錯誤追蹤服務
5. **API 限流**：對公開 API 加入 rate limiting

## 未來改進

1. **身份驗證整合**：完整的 Auth.js 整合
2. **API 版本控制**：支援多版本 API
3. **快取策略**：Redis 快取常用資料
4. **API 文檔生成**：自動生成 OpenAPI 文檔
5. **測試覆蓋**：API 和 Service 的完整測試