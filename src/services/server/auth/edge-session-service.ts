import jwt from 'jsonwebtoken';
import { UserRole } from '@/prisma-generated/postgres-client';

// 使用者會話資料類型
export interface UserSession {
    userId: string;
    username: string;
    email?: string;
    role: UserRole;
    iat: number; // 發行時間
    exp: number; // 過期時間
}

// 公開使用者資料類型（不包含敏感資訊）
export interface PublicUser {
    id: string;
    username: string;
    name: string;
    email?: string;
    role: UserRole;
    is_active: boolean;
    preferred_theme: string;
    created_at: Date;
    last_login?: Date;
    login_count: number;
}

/**
 * Edge Runtime 兼容的會話服務
 * 專門用於中間件和 Edge 環境
 */
export class EdgeSessionService {
    /**
     * 獲取 JWT 密鑰
     */
    private static getSecretKey(): string {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error('NEXTAUTH_SECRET environment variable is not set');
        }
        return secret;
    }

    private static base64UrlDecode(input: string): Uint8Array {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes; // 返回 Uint8Array，SubtleCrypto.verify() 接受此類型
    }

    /**
     * 驗證訪問 token（Edge Runtime 版本）
     * @param token JWT token
     * @returns UserSession | null
     */
    static async verifyAccessToken(token: string): Promise<UserSession | null> {
        try {
            const [header, payload, signature] = token.split('.');
            
            if (!header || !payload || !signature) {
                console.error('[TOKEN VERIFY] Invalid token format - missing parts');
                return null;
            }
            
            const secretKey = new TextEncoder().encode(this.getSecretKey());
            const key = await crypto.subtle.importKey(
                'raw',
                secretKey,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            // 確保 signature 是正確的 Uint8Array 格式
            const signatureBytes = this.base64UrlDecode(signature) as unknown as BufferSource;
            const messageBytes = new TextEncoder().encode(`${header}.${payload}`);

            const isValid = await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBytes,
                messageBytes
            );

            if (!isValid) {
                console.error('[TOKEN VERIFY] Signature verification failed');
                return null;
            }

            let decodedPayload: UserSession;
            try {
                decodedPayload = JSON.parse(atob(payload));
            } catch (e) {
                console.error('[TOKEN VERIFY] Failed to parse payload:', e);
                return null;
            }

            // 檢查 Token 過期時間
            const now = Math.floor(Date.now() / 1000);
            if (decodedPayload.exp && decodedPayload.exp < now) {
                console.warn('[TOKEN VERIFY] Token expired:', {
                    exp: decodedPayload.exp,
                    now,
                    diff: now - decodedPayload.exp
                });
                return null;
            }

            // 檢查必要欄位
            if (!decodedPayload.userId || !decodedPayload.role) {
                console.error('[TOKEN VERIFY] Missing required fields:', {
                    userId: !!decodedPayload.userId,
                    role: !!decodedPayload.role
                });
                return null;
            }

            console.log('[TOKEN VERIFY] Token verified successfully:', {
                userId: decodedPayload.userId,
                role: decodedPayload.role,
                exp: decodedPayload.exp,
                now
            });
            
            return decodedPayload;
        } catch (error) {
            console.error('[TOKEN VERIFY] Verification error:', error);
            return null;
        }
    }

    /**
     * 簡單的 token 解碼（不驗證簽名，僅用於讀取 payload）
     * @param token JWT token
     * @returns Partial<UserSession> | null
     */
    static decodeToken(token: string): Partial<UserSession> | null {
        try {
            const decoded = jwt.decode(token) as UserSession;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}