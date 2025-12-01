import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/services/auth/auth-services';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 使用 AuthService 請求密碼重設
        const success = await requestPasswordReset(body);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Password reset request failed' }, 
                { status: 400 }
            );
        }
        
        return NextResponse.json({
            message: 'Password reset email sent (if email exists)'
        });
        
    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}