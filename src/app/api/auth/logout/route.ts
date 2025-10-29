import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function POST(request: NextRequest) {
    try {
        // 從 cookie 取得 token
        const token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
        
        if (token) {
            // 使用 AuthService 進行登出（讓 token 失效）
            await AuthService.logout(token);
        }
        
        // 清除 cookies
        const response = NextResponse.json({
            message: 'Logout successful'
        });
        
        response.cookies.delete(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
        response.cookies.delete(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
        
        return response;
        
    } catch (error) {
        console.error('Logout error:', error);
        
        // 即使發生錯誤，仍要清除 cookies
        const response = NextResponse.json(
            { error: 'Logout completed with errors' }, 
            { status: 200 }
        );

        response.cookies.delete(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
        response.cookies.delete(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);

        return response;
    }
}