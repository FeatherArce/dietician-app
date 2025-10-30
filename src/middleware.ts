import { NextRequest, NextResponse } from 'next/server';
import { EdgeSessionService } from '@/services/server/auth/edge-session-service';
import { SessionService } from '@/services/server/auth/session-service';
import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from './constants/app-constants';

// 需要認證的路由模式
const protectedRoutes = [
    '/crm',
    '/erp',
    '/lunch',
    '/api/lunch',
    '/api/crm',
    '/api/erp'
];

const homepage = '/';

// 認證相關路由（已登入時重定向）
const authRoutes = [
    ROUTE_CONSTANTS.LOGIN,
    ROUTE_CONSTANTS.REGISTER,
];

// 公開路由（不需要認證）
const publicRoutes = [
    '/api/auth',
    '/auth/reset-password'
];

/**
 * 檢查路由是否符合模式
 */
function matchesPattern(pathname: string, patterns: string[]): boolean {
    return patterns.some(pattern => pathname.startsWith(pattern));
}

/**
 * 從請求中驗證使用者會話
 */
async function validateSession(request: NextRequest) {
    const token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
    if (!token) {
        return null;
    }

    try {
        const session = EdgeSessionService.verifyAccessToken(token);
        return session;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

/**
 * 創建重定向響應
 */
function createRedirect(url: string, request: NextRequest) {
    const redirectUrl = new URL(url, request.url);
    return NextResponse.redirect(redirectUrl);
}

/**
 * 創建認證失敗響應（API 路由）
 */
function createUnauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
}

/**
 * 清除用戶端 Cookie
 */
function clearCookies(): NextResponse {
    const response = NextResponse.next();
    response.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, '', { maxAge: -1 });
    response.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, '', { maxAge: -1 });
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 靜態資源和 Next.js 內部路由跳過
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
    ) {
        return NextResponse.next();
    }

    // 驗證使用者會話
    const session = await validateSession(request);
    const isAuthenticated = !!session;

    if (pathname === homepage) {
        return NextResponse.next();
    }

    // 處理認證路由（登入/註冊頁面）
    if (matchesPattern(pathname, authRoutes)) {
        if (isAuthenticated) {
            // 已登入使用者重定向到主頁或上次訪問頁面
            const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
            return createRedirect(redirectTo, request);
        }
        // 未登入使用者可以訪問認證頁面
        return NextResponse.next();
    }

    // 處理公開路由
    if (matchesPattern(pathname, publicRoutes)) {
        return NextResponse.next();
    }

    // 處理受保護的路由
    if (matchesPattern(pathname, protectedRoutes)) {
        if (!isAuthenticated) {
            // 執行登出邏輯
            await SessionService.logout(request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value || '');

            // 清除 Cookie
            const response = clearCookies();

            // API 路由返回 401
            if (pathname.startsWith('/api/')) {
                return createUnauthorizedResponse();
            }

            // 頁面路由重定向到登入頁面
            const loginUrl = `${ROUTE_CONSTANTS.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
            return createRedirect(loginUrl, request);
        }

        // 檢查特定角色權限（可選）
        const userRole = session.role;

        // CRM 系統權限檢查
        if (pathname.startsWith('/crm') || pathname.startsWith('/api/crm')) {
            // 根據需要設定 CRM 權限規則
            // 例如：只有 ADMIN 和 MANAGER 可以訪問
            if (!['ADMIN', 'MANAGER'].includes(userRole)) {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json(
                        { error: 'Insufficient permissions' },
                        { status: 403 }
                    );
                }
                return createRedirect('/unauthorized', request);
            }
        }

        // ERP 系統權限檢查
        if (pathname.startsWith('/erp') || pathname.startsWith('/api/erp')) {
            // 根據需要設定 ERP 權限規則
            // 例如：只有 ADMIN 可以訪問
            if (userRole !== 'ADMIN') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json(
                        { error: 'Insufficient permissions' },
                        { status: 403 }
                    );
                }
                return createRedirect('/unauthorized', request);
            }
        }

        // 已認證且有權限的使用者可以訪問
        return NextResponse.next();
    }

    // 預設允許訪問其他路由
    return NextResponse.next();
}

// 中間件配置
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};