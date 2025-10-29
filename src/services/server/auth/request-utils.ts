import { NextRequest } from 'next/server';
import { SessionService, type UserSession } from '@/services/server/auth/session-service';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

/**
 * 從 NextRequest 中獲取用戶會話
 * @param request NextRequest 對象
 * @returns UserSession | null
 */
export function getSessionFromRequest(request: NextRequest): UserSession | null {
    try {
        // 首先嘗試從 cookies 中獲取 token
        const cookieToken = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
        if (cookieToken) {
            const session = SessionService.verifyAccessToken(cookieToken);
            if (session) {
                return session;
            }
        }

        // 如果 cookies 中沒有，嘗試從 Authorization header 中獲取
        const authHeader = request.headers.get('Authorization');
        const headerToken = SessionService.extractTokenFromHeader(authHeader);
        
        if (headerToken) {
            const session = SessionService.verifyAccessToken(headerToken);
            if (session) {
                return session;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting session from request:', error);
        return null;
    }
}