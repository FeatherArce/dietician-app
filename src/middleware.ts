import { NextRequest, NextResponse } from 'next/server';
import { ROUTE_CONSTANTS } from './constants/app-constants';
import { getToken } from 'next-auth/jwt';

// 需要認證的路由模式
const protectedRoutes = [
    '/lunch',
    '/api/lunch',
];

const adminOnlyRoutes = [
    // 在此添加僅限管理員訪問的路由模式
    '/crm',
    '/erp',
    '/api/crm',
    '/api/erp',
    '/users',    
];

const rootPage = '/';
const defaultAuthRedirectPage = '/lunch';

// 認證相關路由（已登入時重定向）
const loginRoutes = [
    ROUTE_CONSTANTS.LOGIN,
    ROUTE_CONSTANTS.REGISTER,
];

// 公開路由（不需要認證）
const publicRoutes = [
    '/api/auth',
    '/auth/reset-password'
];

// Edge 環境不能使用 prisma 客戶端，只是匯入型別也不行，因此改用字串陣列定義角色
const adminRole = 'ADMIN';

// 檢查路由是否符合模式
function matchesPattern(pathname: string, patterns: string[]): boolean {
    return patterns.some(pattern => pathname.startsWith(pattern));
}

// 創建重定向響應
function createRedirect(url: string, request: NextRequest) {
    const redirectUrl = new URL(url, request.url);
    return NextResponse.redirect(redirectUrl);
}

function isApiRoute(pathname: string): boolean {
    return pathname.startsWith('/api/');
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

    // console.log(`[MIDDLEWARE] Processing request for: ${pathname}`);
    // console.log(`[MIDDLEWARE] Cookies:`, request.cookies);

    // 在 Edge 環境中使用 getToken 來獲取 JWT token 時，需要指定 cookie 名稱
    const nextAuthCookieName = process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';
    // 取得使用者的 JWT token
    const jwtToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: nextAuthCookieName
    });
    // console.log(`[MIDDLEWARE] Token`, jwtToken);
    const isAuthenticated = !!jwtToken;

    // 處理根目錄路由
    if (pathname === rootPage) {
        return NextResponse.next();
    }

    // 處理認證路由（Root/登入/註冊頁面）
    if (matchesPattern(pathname, loginRoutes)) {
        // console.log(`[MIDDLEWARE] Auth route accessed: ${pathname}, isAuthenticated: ${isAuthenticated}`);

        if (isAuthenticated) {
            // 已登入使用者重定向到主頁或上次訪問頁面
            const redirectTo = request.nextUrl.searchParams.get('redirect');
            const finalRedirect = redirectTo || defaultAuthRedirectPage;

            // console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to ${finalRedirect}`);
            return createRedirect(finalRedirect, request);
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
            // API 路由返回 401
            if (isApiRoute(pathname)) {
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

        // 已認證且有權限的使用者可以訪問
        return NextResponse.next();
    }
    if (matchesPattern(pathname, adminOnlyRoutes)) {
        if (!isAuthenticated) {
            // API 路由返回 401
            if (isApiRoute(pathname)) {
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
        const userRole = jwtToken?.role || '';
        if (adminRole !== userRole) {
            // API 路由返回 401
            if (isApiRoute(pathname)) {
                return NextResponse.json(
                    { error: 'Insufficient permissions' },
                    { status: 403 }
                );
            }
            // 頁面路由重定向到未授權頁面
            return createRedirect('/unauthorized', request);
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