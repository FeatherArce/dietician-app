import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth';
import { updateProfileSchema } from '@/services/server/auth/validation-schemas';
import { auth } from "@/libs/auth";
import { ApiResponse } from '../../utils';

export async function PATCH(request: NextRequest) {
    try {
        // 驗證用戶是否已登入
        const session = await auth();
        if (!session?.user?.id) {
            return ApiResponse.error(401);
        }

        const body = await request.json();
        console.log('Profile update request:', body);

        // 驗證輸入資料
        const validation = updateProfileSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
            return NextResponse.json(
                { error: errors.join(', '), success: false },
                { status: 400 }
            );
        }

        const { name, email, preferred_theme } = validation.data;

        // 更新用戶資料
        const result = await AuthService.updateProfile(session?.user?.id, {
            name,
            email,
            preferred_theme
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || '更新失敗', success: false },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '個人資料更新成功',
            user: result.user
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, success: false },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: '更新個人資料失敗', success: false },
            { status: 500 }
        );
    }
}