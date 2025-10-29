import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/server/auth';
import { userService } from '@/services/server/user-services';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function POST(request: NextRequest) {
    try {
        // 從 cookie 取得 refresh token
        const refreshToken = request.cookies.get(AUTH_CONSTANTS.REFRESH_TOKEN_KEY)?.value;
        
        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token provided' }, 
                { status: 401 }
            );
        }
        
        // 驗證 refresh token
        const refreshData = SessionService.verifyRefreshToken(refreshToken);
        
        if (!refreshData) {
            return NextResponse.json(
                { error: 'Invalid refresh token' }, 
                { status: 401 }
            );
        }
        
        // 獲取使用者資料
        const user = await userService.getUserById(refreshData.userId);
        
        if (!user || !user.is_active) {
            return NextResponse.json(
                { error: 'User not found or inactive' }, 
                { status: 401 }
            );
        }
        
        // 生成新的 access token
        const newToken = SessionService.generateAccessToken(userService.toPublicUser(user));
        
        // 設定新的 token
        const response = NextResponse.json({
            user: userService.toPublicUser(user),
            message: 'Token refreshed successfully'
        });
        
        response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 1 day
        });
        
        return response;
        
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}