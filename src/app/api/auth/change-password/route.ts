import { NextRequest, NextResponse } from 'next/server';
import { changePasswordSchema } from '@/services/server/auth/validation-schemas';
import { auth } from "@/libs/auth";
import { ApiMessage } from '../../utils';
import { changePassword } from '@/services/server/auth/auth-services';

export async function POST(request: NextRequest) {
    try {
        // 驗證用戶是否已登入
        const session = await auth();
        if (!session?.user?.id) {
            return ApiMessage.error(401);
        }

        const body = await request.json();
        console.log('Change password request for user:', session?.user?.id);

        // 驗證輸入資料
        const validation = changePasswordSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
            return NextResponse.json(
                { error: errors.join(', '), success: false },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword, confirmPassword } = validation.data;

        // 更改密碼
        const result = await changePassword(session?.user?.id, {
            currentPassword,
            newPassword,
            confirmPassword
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || '更改密碼失敗', success: false },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '密碼更改成功'
        });

    } catch (error) {
        console.error('Change password error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, success: false },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: '更改密碼失敗', success: false },
            { status: 500 }
        );
    }
}