import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function POST(request: NextRequest) {
    console.log("Request method:", request.method, request.url);
    try {
        const body = await request.json();
        
        // 使用 AuthService 進行登入
        const result = await AuthService.login(body);
        
        if (!result.success) {
            return NextResponse.json(
                { 
                    error: result.message || 'Login failed',
                    errors: result.errors 
                }, 
                { status: 401 }
            );
        }

        const { user, token, refreshToken } = result;
        
        if (!user || !token) {
            return NextResponse.json(
                { error: 'Login failed - missing user or token' }, 
                { status: 500 }
            );
        }
        
        // 設定 HTTP-only cookies
        const response = NextResponse.json({
            success: true,
            user: user,
            token: token,  // 也返回 token 給前端使用
            message: 'Login successful'
        });
        
        // 設定主要 token
        response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 1 day
        });
        
        // 設定 refresh token（如果有的話）
        if (refreshToken) {
            response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 // 7 days
            });
        }
        
        return response;        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}