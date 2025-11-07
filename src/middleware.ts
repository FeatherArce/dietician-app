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

const rootPage = '/';
const defaultAuthRedirectPage = '/lunch';

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
    const allCookies = request.cookies.getAll();

    console.log('[MIDDLEWARE DEBUG] Cookie validation:', {
        hasToken: !!token,
        allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        tokenLength: token?.length || 0
    });

    if (!token) {
        console.log('[MIDDLEWARE DEBUG] No token found in cookies');
        return null;
    }

    try {
        console.log('[MIDDLEWARE DEBUG] Verifying token...');
        const session = await EdgeSessionService.verifyAccessToken(token);

        if (!session) {
            console.log('[MIDDLEWARE DEBUG] Token verification returned null/falsy');
            return null;
        }

        console.log('[MIDDLEWARE DEBUG] Token verified successfully:', {
            userId: session.userId,
            role: session.role,
            exp: session.exp,
            iat: session.iat,
            now: Math.floor(Date.now() / 1000)
        });

        return session;
    } catch (error) {
        console.error('[MIDDLEWARE DEBUG] Token validation error:', error);
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
function clearCookies(response?: NextResponse): NextResponse {
    const res = response || NextResponse.next();
    res.cookies.set(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, '', { 
        maxAge: -1,
        path: '/',
        httpOnly: true 
    });
    res.cookies.set(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, '', { 
        maxAge: -1,
        path: '/',
        httpOnly: true 
    });
    return res;
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
    console.log('[MIDDLEWARE] Session validation result:', session);
    const isAuthenticated = !!session;

    // 處理根目錄路由
    if (pathname === rootPage) {
        return NextResponse.next();
    }

    // 處理認證路由（Root/登入/註冊頁面）
    if (matchesPattern(pathname, authRoutes)) {
        console.log(`[MIDDLEWARE] Auth route accessed: ${pathname}, isAuthenticated: ${isAuthenticated}`);
        
        if (isAuthenticated) {
            // 已登入使用者重定向到主頁或上次訪問頁面
            const redirectTo = request.nextUrl.searchParams.get('redirect');
            const finalRedirect = redirectTo || defaultAuthRedirectPage;
            
            console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to ${finalRedirect}`);
            
            if (redirectTo) {
                return createRedirect(redirectTo, request);
            } else {
                return createRedirect(defaultAuthRedirectPage, request);
            }
        } else {
            // 未登入使用者訪問認證頁面時
            console.log(`[MIDDLEWARE] Unauthenticated user accessing ${pathname}`);
            
            // 注意：不要在這裡清除 cookies！
            // 因為用戶可能剛剛登入，cookies 已設置但 middleware 驗證時間點可能有差異
            // 讓前端決定是否需要清除
            
            // 只有當有明確無效的 token 時才需要處理
            const hasToken = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
            if (hasToken) {
                console.log('[MIDDLEWARE] Found token but authentication failed - token may be expired');
                // 不在 middleware 清除，讓前端通過 /api/auth/me 的 401 來處理
                // await SessionService.logout(hasToken);
            }
            
            // 直接通過，讓前端和 API 層處理
            return NextResponse.next();
        }
    }

    // 處理公開路由
    if (matchesPattern(pathname, publicRoutes)) {
        return NextResponse.next();
    }

    // 處理受保護的路由
    if (matchesPattern(pathname, protectedRoutes)) {
        if (!isAuthenticated) {
            console.log('Unauthorized access attempt to:', pathname);
            // 執行登出邏輯
            await SessionService.logout(request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value || '');

            // API 路由返回 401
            if (pathname.startsWith('/api/')) {
                const unauthorizedResponse = NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
                return clearCookies(unauthorizedResponse);
            }

            // 頁面路由重定向到登入頁面
            const newRedirectUrl = new URL(ROUTE_CONSTANTS.LOGIN, request.url);
            newRedirectUrl.searchParams.set('redirect', pathname);
            newRedirectUrl.searchParams.set('from', 'protected');
            const redirectResponse = NextResponse.redirect(newRedirectUrl);
            return clearCookies(redirectResponse);
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