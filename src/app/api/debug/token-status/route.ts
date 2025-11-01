import { NextRequest, NextResponse } from 'next/server';
import { EdgeSessionService } from '@/services/server/auth/edge-session-service';
import { AUTH_CONSTANTS } from '@/constants/app-constants';

/**
 * 診斷 API：檢查 Token 狀態和伺服器時間
 * 
 * 使用方式:
 * curl -H "Cookie: auth-token=YOUR_TOKEN" http://localhost:3000/api/debug/token-status
 */
export async function GET(request: NextRequest) {
    const token = request.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_KEY)?.value;
    const now = Math.floor(Date.now() / 1000);
    const currentDate = new Date();

    const response = {
        debug: true,
        serverTime: {
            timestamp: now,
            iso: currentDate.toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        token: {
            exists: !!token,
            present: !!token ? '✅ Present' : '❌ Missing',
        },
        cookie: {
            name: AUTH_CONSTANTS.ACCESS_TOKEN_KEY,
            value: token ? `${token.substring(0, 20)}...` : 'N/A',
        },
    };

    // 如果有 Token，嘗試驗證它
    if (token) {
        try {
            // 嘗試解碼 payload（不驗證簽名）
            const [header, payload, signature] = token.split('.');
            if (!header || !payload || !signature) {
                return NextResponse.json({
                    ...response,
                    tokenAnalysis: {
                        status: 'INVALID_FORMAT',
                        message: 'Token format is invalid (missing parts)',
                    },
                });
            }

            let decodedPayload: any;
            try {
                decodedPayload = JSON.parse(atob(payload));
            } catch (e) {
                return NextResponse.json({
                    ...response,
                    tokenAnalysis: {
                        status: 'DECODE_ERROR',
                        message: 'Failed to decode token payload',
                    },
                });
            }

            const { exp, iat, userId, role } = decodedPayload;
            const isExpired = exp && exp < now;
            const expiresIn = exp ? exp - now : null;
            const expiresInHours = expiresIn ? Math.floor(expiresIn / 3600) : null;

            // 現在驗證簽名
            let signatureValid = false;
            try {
                const verified = await EdgeSessionService.verifyAccessToken(token);
                signatureValid = !!verified;
            } catch (e) {
                console.error('Signature verification error:', e);
                signatureValid = false;
            }

            return NextResponse.json({
                ...response,
                tokenAnalysis: {
                    status: isExpired ? 'EXPIRED' : signatureValid ? 'VALID' : 'INVALID_SIGNATURE',
                    message: isExpired 
                        ? `Token expired ${Math.abs(expiresIn!)} seconds ago`
                        : signatureValid 
                        ? `Token is valid for ${expiresInHours} more hours`
                        : 'Token signature verification failed',
                    payload: {
                        userId,
                        role,
                        iat: iat ? new Date(iat * 1000).toISOString() : null,
                        exp: exp ? new Date(exp * 1000).toISOString() : null,
                        expiresInSeconds: expiresIn,
                        isExpired,
                    },
                    signatureValid,
                },
            });
        } catch (error) {
            console.error('[DEBUG API] Token analysis error:', error);
            return NextResponse.json({
                ...response,
                tokenAnalysis: {
                    status: 'ERROR',
                    message: `Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            });
        }
    }

    return NextResponse.json(response);
}
