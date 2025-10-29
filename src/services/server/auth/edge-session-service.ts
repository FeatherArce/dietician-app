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

    private static base64UrlDecode(input: string): ArrayBuffer {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer; // 返回 ArrayBuffer
    }

    /**
     * 驗證訪問 token（Edge Runtime 版本）
     * @param token JWT token
     * @returns UserSession | null
     */
    static async verifyAccessToken(token: string): Promise<UserSession | null> {
        // This code block is commented out because 'crypto' module is not supported in Edge Runtime
        // try {
        //     const decoded = jwt.verify(token, this.getSecretKey()) as UserSession;
        //     console.log('Decoded token:', decoded);

        //     // 基本驗證
        //     if (!decoded.userId || !decoded.username || !decoded.role) {
        //         return null;
        //     }

        //     return decoded;
        // } catch (error) {
        //     // Token 無效、過期或格式錯誤
        //     console.error('Token verification error:', error);
        //     return null;
        // }
        try {
            const [header, payload, signature] = token.split('.');
            const secretKey = new TextEncoder().encode(this.getSecretKey());
            const key = await crypto.subtle.importKey(
                'raw',
                secretKey,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const isValid = await crypto.subtle.verify(
                'HMAC',
                key,
                this.base64UrlDecode(signature),
                new TextEncoder().encode(`${header}.${payload}`)
            );

            if (!isValid) {
                return null;
            }

            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload as UserSession;
        } catch (error) {
            // Token 無效、過期或格式錯誤
            console.error('Token verification error:', error);
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