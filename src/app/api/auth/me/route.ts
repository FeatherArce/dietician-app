import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/server/auth';
import { userService } from '@/services/server/lunch/user-services';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function GET(request: NextRequest) {
    try {
        // 嘗試從 Authorization header 取得 token
        const authHeader = request.headers.get('Authorization');
        let token = authHeader?.replace('Bearer ', '');
        
        // 如果沒有 Authorization header，則從 cookie 取得
        if (!token) {
            token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
        }
        
        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' }, 
                { status: 401 }
            );
        }
        
        // 驗證 access token
        const sessionData = SessionService.verifyAccessToken(token);
        
        if (!sessionData) {
            return NextResponse.json(
                { error: 'Invalid token' }, 
                { status: 401 }
            );
        }
        
        // 獲取最新的使用者資料
        const user = await userService.getUserById(sessionData.userId);
        
        if (!user || !user.is_active) {
            return NextResponse.json(
                { error: 'User not found or inactive' }, 
                { status: 401 }
            );
        }
        
        return NextResponse.json({
            user: userService.toPublicUser(user)
        });
        
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}