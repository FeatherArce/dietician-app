import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/server/auth';
import { userService } from '@/services/server/user-services';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

export async function GET(request: NextRequest) {
    try {
        // 嘗試從 Authorization header 取得 token
        const authHeader = request.headers.get('Authorization');
        let token = authHeader?.replace('Bearer ', '');
        
        console.log('[/api/auth/me] Authorization header:', authHeader ? 'present' : 'missing');
        
        // 如果沒有 Authorization header，則從 cookie 取得
        if (!token) {
            const allCookies = request.cookies.getAll();
            console.log('[/api/auth/me] Cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
            
            token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
            console.log('[/api/auth/me] Token from cookie:', token ? 'found' : 'not found');
        }
        
        if (!token) {
            console.log('[/api/auth/me] No token found - returning 401');
            return NextResponse.json(
                { error: 'Not authenticated' }, 
                { status: 401 }
            );
        }
        
        // 驗證 access token
        console.log('[/api/auth/me] Verifying token...');
        const sessionData = SessionService.verifyAccessToken(token);
        
        if (!sessionData) {
            console.log('[/api/auth/me] Token verification failed');
            return NextResponse.json(
                { error: 'Invalid token' }, 
                { status: 401 }
            );
        }
        
        console.log('[/api/auth/me] Token verified, userId:', sessionData.userId);
        
        // 獲取最新的使用者資料
        const user = await userService.getUserById(sessionData.userId);
        
        if (!user || !user.is_active) {
            console.log('[/api/auth/me] User not found or inactive');
            return NextResponse.json(
                { error: 'User not found or inactive' }, 
                { status: 401 }
            );
        }
        
        console.log('[/api/auth/me] Returning user:', user.email);
        
        return NextResponse.json({
            user: userService.toPublicUser(user),
            token: token // 也返回 token，方便前端存到 localStorage
        });
        
    } catch (error) {
        console.error('[/api/auth/me] Get current user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}