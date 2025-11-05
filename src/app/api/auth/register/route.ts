import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 使用 AuthService 進行註冊
        const result = await AuthService.register(body);
        
        if (!result.success) {
            return NextResponse.json(
                { 
                    error: result.message || 'Registration failed',
                    errors: result.errors 
                }, 
                { status: 400 }
            );
        }

        const { user, token } = result;
        
        if (!user || !token) {
            return NextResponse.json(
                { error: 'Registration failed - missing user or token' }, 
                { status: 500 }
            );
        }
        
        // 設定 HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            user: user,
            token: token,  // 也返回 token 給前端使用
            message: 'Registration successful'
        });
        
        response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 1 day
        });
        
        return response;
        
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}