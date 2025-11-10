import { NextRequest, NextResponse } from 'next/server';
import { ROUTE_CONSTANTS } from './constants/app-constants';
import { auth } from './libs/auth';

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
 * 創建重定向響應
 */
function createRedirect(url: string, request: NextRequest) {
    const redirectUrl = new URL(url, request.url);
    return NextResponse.redirect(redirectUrl);
}

// NextAuth 中間件集成
// https://authjs.dev/reference/nextjs#in-middleware

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
    const session = await auth();
    console.log('[MIDDLEWARE] Session validation result:', session);
    const isAuthenticated = !!session?.user;

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
        }
        return NextResponse.next();
    }

    // 處理公開路由
    if (matchesPattern(pathname, publicRoutes)) {
        return NextResponse.next();
    }

    // 處理受保護的路由
    if (matchesPattern(pathname, protectedRoutes)) {
        if (!isAuthenticated) {
            console.log('Unauthorized access attempt to:', pathname);

            // API 路由返回 401
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // 頁面路由重定向到登入頁面
            const newRedirectUrl = new URL(ROUTE_CONSTANTS.LOGIN, request.url);
            newRedirectUrl.searchParams.set('redirect', pathname);
            newRedirectUrl.searchParams.set('from', 'protected');
            return NextResponse.redirect(newRedirectUrl);
        }

        // 檢查特定角色權限（可選）
        const userRole = session.user?.role || '';

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