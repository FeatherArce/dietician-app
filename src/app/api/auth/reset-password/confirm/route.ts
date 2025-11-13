import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/services/server/auth/auth-services';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 使用 AuthService 重設密碼
        const result = await resetPassword(body);
        
        if (!result.success) {
            return NextResponse.json(
                { 
                    error: result.message || 'Password reset failed',
                    errors: result.errors 
                }, 
                { status: 400 }
            );
        }
        
        return NextResponse.json({
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}