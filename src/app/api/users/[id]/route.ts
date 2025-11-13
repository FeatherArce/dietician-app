import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/server/user-services';
import { UserRole } from '@/prisma-generated/postgres-client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const searchParams = request.nextUrl.searchParams;
        const includeStats = searchParams.get('include') === 'stats';

        const user = await userService.getUserById(userId);

        if (!user) {
            return NextResponse.json(
                { error: '找不到使用者', success: false },
                { status: 404 }
            );
        }

        // 如果需要統計資料，額外獲取
        let userStats = null;
        if (includeStats) {
            try {
                userStats = await userService.getUserStats(userId);
            } catch (error) {
                console.warn('Failed to fetch user stats:', error);
                // 即使統計失敗，仍然返回使用者資料
            }
        }

        return NextResponse.json({
            user,
            stats: userStats,
            success: true
        });

    } catch (error) {
        const { id: userId } = await params;
        console.error(`GET /api/lunch/users/${userId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch user', success: false },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const data = await request.json();

        if (data.email) {
            // 不允許更新 email
            delete data.email;
            // 驗證 email 格式（如果有提供）
            // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // if (!emailRegex.test(data.email)) {
            //     return NextResponse.json(
            //         { error: 'Email 格式不正確', success: false }, 
            //         { status: 400 }
            //     );
            // }
        }

        // 驗證角色（如果有提供）
        if (data.role && !Object.values(UserRole).includes(data.role)) {
            return NextResponse.json(
                { error: '無效的使用者角色', success: false },
                { status: 400 }
            );
        }

        const user = await userService.updateUser(userId, data);
        return NextResponse.json({
            user,
            message: '使用者已更新',
            success: true
        });

    } catch (error) {
        const { id: userId } = await params;
        console.error(`PATCH /api/lunch/users/${userId} error:`, error);

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;

        // 使用軟刪除
        const user = await userService.deleteUser(userId);
        return NextResponse.json({
            user,
            message: '使用者已刪除',
            success: true
        });

    } catch (error) {
        const { id: userId } = await params;
        console.error(`DELETE /api/lunch/users/${userId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to deactivate user', success: false },
            { status: 500 }
        );
    }
}

// 額外的使用者操作端點

// 啟用使用者
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const data = await request.json();

        switch (data.action) {
            case 'update':
                const newData = { ...data };
                delete newData.action;
                delete newData.password; // 密碼不在此處更新
                const updatedUser = await userService.updateUser(userId, newData);
                return NextResponse.json({
                    user: updatedUser,
                    message: '使用者已更新',
                    success: true
                });

            case 'activate':
                const activatedUser = await userService.activateUser(userId);
                return NextResponse.json({
                    user: activatedUser,
                    message: '使用者已啟用',
                    success: true
                });

            case 'update_role':
                if (!data.role || !Object.values(UserRole).includes(data.role)) {
                    return NextResponse.json(
                        { error: '無效的使用者角色', success: false },
                        { status: 400 }
                    );
                }
                const roleUpdatedUser = await userService.updateUserRole(userId, data.role);
                return NextResponse.json({
                    user: roleUpdatedUser,
                    message: '使用者角色已更新',
                    success: true
                });

            case 'force_reset_password':
                await userService.forceResetPassword(userId, data.password);
                return NextResponse.json({
                    message: '密碼重設郵件已發送',
                    success: true
                });
            case 'verify_email':
                const verifiedUser = await userService.verifyEmail(userId);
                return NextResponse.json({
                    user: verifiedUser,
                    message: 'Email 已驗證',
                    success: true
                });

            default:
                return NextResponse.json(
                    { error: '無效的操作', success: false },
                    { status: 400 }
                );
        }

    } catch (error) {
        const { id: userId } = await params;
        console.error(`POST /api/lunch/users/${userId} error:`, error);
        return NextResponse.json(
            { error: 'Failed to perform user action', success: false },
            { status: 500 }
        );
    }
}