import { NextRequest, NextResponse } from 'next/server';
import { urlSearchParamsToUserFilters, userService, type CreateUserData, type UserFilters } from '@/services/server/user-services';
import { UserRole } from '@/prisma-generated/postgres-client';
import { PasswordService } from '@/services/server/auth/password-service';
import { GetUsersResponse } from '@/types/api/user';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        // 解析查詢參數
        const filters = urlSearchParamsToUserFilters(searchParams);

        const users = await userService.getUsers(filters);
        const response : GetUsersResponse = { success: true, data: { users } };
        return NextResponse.json(response);
        
    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', success: false }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        
        // 驗證必要欄位
        if (!data.name || !data.email) {
            return NextResponse.json(
                { error: '缺少必要欄位: name, email', success: false }, 
                { status: 400 }
            );
        }

        // 如果提供了密碼，則需要密碼驗證
        if (data.password) {
            if (!data.password || data.password.length < 8) {
                return NextResponse.json(
                    { error: '密碼至少需要 8 個字符', success: false }, 
                    { status: 400 }
                );
            }
        }

        // 驗證 email 格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return NextResponse.json(
                { error: 'Email 格式不正確', success: false }, 
                { status: 400 }
            );
        }

        // 驗證角色
        if (data.role && !Object.values(UserRole).includes(data.role)) {
            return NextResponse.json(
                { error: '無效的使用者角色', success: false }, 
                { status: 400 }
            );
        }

        // 準備使用者資料
        const userData: CreateUserData = {
            name: data.name,
            email: data.email,
            note: data.note,
            role: data.role || UserRole.USER,
            is_active: data.is_active ?? true,
            email_verified: data.email_verified ?? false
        };

        // 如果提供了密碼，則進行哈希處理
        if (data.password) {
            userData.password_hash = await PasswordService.hash(data.password);
        }

        const user = await userService.createUser(userData);
        return NextResponse.json({ 
            user, 
            message: '使用者已新增', 
            success: true 
        }, { status: 201 });
        
    } catch (error) {
        console.error('POST /api/lunch/users error:', error);
        
        // 處理 unique constraint 錯誤
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'Email 已存在', success: false }, 
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create user', success: false }, 
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        
        if (!data.id) {
            return NextResponse.json(
                { error: '缺少使用者ID', success: false }, 
                { status: 400 }
            );
        }

        // 驗證 email 格式（如果有提供）
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return NextResponse.json(
                    { error: 'Email 格式不正確', success: false }, 
                    { status: 400 }
                );
            }
        }

        // 驗證角色（如果有提供）
        if (data.role && !Object.values(UserRole).includes(data.role)) {
            return NextResponse.json(
                { error: '無效的使用者角色', success: false }, 
                { status: 400 }
            );
        }

        const { id, ...updateData } = data;

        const user = await userService.updateUser(id, updateData);
        return NextResponse.json({ 
            user, 
            message: '使用者已更新', 
            success: true 
        });
        
    } catch (error) {
        console.error('PUT /api/lunch/users error:', error);
        
        // 處理 unique constraint 錯誤
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'Email 已存在', success: false }, 
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to update user', success: false }, 
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();
        
        if (!data.id) {
            return NextResponse.json(
                { error: '缺少使用者ID', success: false }, 
                { status: 400 }
            );
        }

        // 使用 deactivateUser 而不是 deleteUser（軟刪除）
        const user = await userService.deleteUser(data.id);
        return NextResponse.json({ 
            user, 
            message: '使用者已停用', 
            success: true 
        });
        
    } catch (error) {
        console.error('DELETE /api/lunch/users error:', error);
        return NextResponse.json(
            { error: 'Failed to deactivate user', success: false }, 
            { status: 500 }
        );
    }
}